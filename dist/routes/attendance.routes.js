"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Attendance_1 = require("../models/Attendance");
const dayjs_1 = __importDefault(require("dayjs"));
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.post('/bulk', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.ATTENDANCE_MARK), async (req, res, next) => {
    try {
        const { records, classId, date, entityType } = req.body; // records: [{entityId, status}]
        const tenantId = req.user.tenantId;
        const ops = records.map((record) => ({
            updateOne: {
                filter: { tenantId, entityId: record.entityId, date: new Date(date) },
                update: { $set: { tenantId, entityId: record.entityId, entityType, classId, date: new Date(date), status: record.status, markedById: req.user.userId } },
                upsert: true,
            },
        }));
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
        const records = await Attendance_1.Attendance.find({
            tenantId: req.user.tenantId, classId: req.params.classId,
            date: date ? new Date(date) : { $gte: (0, dayjs_1.default)().startOf('day').toDate() },
        }).populate('entityId', 'name admissionNo').lean();
        res.json({ success: true, data: records });
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