"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Attendance_1 = require("../models/Attendance");
const dayjs_1 = __importDefault(require("dayjs"));
const Student_1 = require("../models/Student");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.post('/bulk', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.ATTENDANCE_MARK), async (req, res, next) => {
    try {
        const { records, classId, date, entityType } = req.body;
        const tenantId = req.user.tenantId;
        const ops = records.map((record) => {
            const recordDate = record.date ? new Date(record.date) : new Date(date);
            return {
                updateOne: {
                    filter: {
                        tenantId: new mongoose_1.default.Types.ObjectId(tenantId),
                        entityId: new mongoose_1.default.Types.ObjectId(record.entityId),
                        date: recordDate
                    },
                    update: {
                        $set: {
                            tenantId: new mongoose_1.default.Types.ObjectId(tenantId),
                            entityId: new mongoose_1.default.Types.ObjectId(record.entityId),
                            entityType,
                            classId: classId ? new mongoose_1.default.Types.ObjectId(classId) : undefined,
                            date: recordDate,
                            status: record.status,
                            markedById: new mongoose_1.default.Types.ObjectId(req.user.userId)
                        }
                    },
                    upsert: true,
                }
            };
        });
        await Attendance_1.Attendance.bulkWrite(ops);
        res.json({ success: true, message: `${records.length} attendance records saved` });
    }
    catch (e) {
        next(e);
    }
});
r.get('/class/:classId', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.ATTENDANCE_VIEW), async (req, res, next) => {
    try {
        const { date } = req.query;
        const queryDate = date ? new Date(date) : (0, dayjs_1.default)().startOf('day').toDate();
        queryDate.setHours(0, 0, 0, 0);
        const students = await Student_1.Student.find({
            tenantId: req.user.tenantId,
            classId: req.params.classId,
            status: 'active',
            isDeleted: { $ne: true }
        }).populate({ path: 'memberId', select: 'name', options: { strictPopulate: false } }).lean();
        const records = await Attendance_1.Attendance.find({
            tenantId: req.user.tenantId,
            classId: req.params.classId,
            date: queryDate,
        }).lean();
        const recordsMap = new Map(records.map(r => [r.entityId?.toString() || '', r]));
        const data = students.map((s) => {
            const savedRecord = recordsMap.get(s._id.toString());
            return {
                _id: savedRecord?._id || undefined,
                entityId: {
                    _id: s._id,
                    name: s.memberId?.name || s.name || 'Unknown Student',
                    admissionNo: s.admissionNo || '—'
                },
                date: queryDate,
                status: savedRecord?.status || 'present',
                isSaved: !!savedRecord
            };
        });
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
r.get('/class/:classId/monthly', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.ATTENDANCE_VIEW), async (req, res, next) => {
    try {
        const { year, month } = req.query;
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) || (new Date().getMonth() + 1);
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0);
        endDate.setHours(23, 59, 59, 999);
        const records = await Attendance_1.Attendance.find({
            tenantId: req.user.tenantId,
            classId: req.params.classId,
            date: { $gte: startDate, $lte: endDate }
        }).select('entityId date status').lean();
        const students = await Student_1.Student.find({
            tenantId: req.user.tenantId,
            classId: req.params.classId,
            status: 'active',
            isDeleted: { $ne: true }
        }).populate({ path: 'memberId', select: 'name', options: { strictPopulate: false } }).lean();
        const formattedStudents = students.map((s) => ({
            _id: s._id,
            name: s.memberId?.name || s.name || 'Unknown Student',
            admissionNo: s.admissionNo || '—'
        }));
        res.json({
            success: true,
            data: {
                students: formattedStudents,
                records: records.map((r) => ({
                    entityId: r.entityId,
                    date: r.date,
                    status: r.status
                }))
            }
        });
    }
    catch (e) {
        next(e);
    }
});
r.get('/report', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.ATTENDANCE_REPORTS), async (req, res, next) => {
    try {
        const { classId, startDate, endDate, entityType } = req.query;
        const filter = { tenantId: req.user.tenantId, entityType };
        if (classId)
            filter.classId = classId;
        if (startDate && endDate)
            filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        const data = await Attendance_1.Attendance.aggregate([
            { $match: filter },
            { $group: { _id: { entityId: '$entityId', status: '$status' }, count: { $sum: 1 } } },
            { $group: { _id: '$_id.entityId', attendance: { $push: { status: '$_id.status', count: '$count' } } } },
        ]);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
exports.default = r;
//# sourceMappingURL=attendance.routes.js.map