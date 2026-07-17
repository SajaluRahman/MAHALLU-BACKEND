"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Student_1 = require("../models/Student");
const Member_1 = require("../models/Member");
const errorHandler_1 = require("../middleware/errorHandler");
const qrcode_1 = __importDefault(require("qrcode"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.STUDENT_VIEW), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, classId, status, search } = req.query;
        const tenantId = req.user.tenantId;
        const filter = { tenantId };
        if (classId)
            filter.classId = classId;
        if (status)
            filter.status = status;
        if (search) {
            const matchingMembers = await Member_1.Member.find({ tenantId, name: { $regex: search, $options: 'i' } }, '_id').lean();
            const memberIds = matchingMembers.map(m => m._id);
            filter.$or = [
                { admissionNo: { $regex: search, $options: 'i' } },
                { memberId: { $in: memberIds } }
            ];
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const [students, total] = await Promise.all([
            Student_1.Student.find(filter).populate('memberId', 'name photo dateOfBirth gender phone').populate('classId', 'name').populate('guardianId', 'name phone').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
            Student_1.Student.countDocuments(filter),
        ]);
        res.json({ success: true, data: students, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (e) {
        next(e);
    }
});
router.get('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.STUDENT_VIEW), async (req, res, next) => {
    try {
        const student = await Student_1.Student.findOne({ _id: req.params.id, tenantId: req.user.tenantId }).populate('memberId classId guardianId').lean();
        if (!student)
            throw new errorHandler_1.AppError('Student not found', 404);
        res.json({ success: true, data: student });
    }
    catch (e) {
        next(e);
    }
});
router.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.STUDENT_CREATE), async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId;
        const count = await Student_1.Student.countDocuments({ tenantId });
        const admissionNo = `STD-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        const qrData = JSON.stringify({ admissionNo, tenantId, type: 'student' });
        const qrCode = await qrcode_1.default.toDataURL(qrData);
        const student = await Student_1.Student.create({ ...req.body, tenantId, admissionNo, qrCode });
        res.status(201).json({ success: true, data: student });
    }
    catch (e) {
        next(e);
    }
});
router.put('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.STUDENT_UPDATE), async (req, res, next) => {
    try {
        const student = await Student_1.Student.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $set: req.body }, { new: true });
        if (!student)
            throw new errorHandler_1.AppError('Student not found', 404);
        res.json({ success: true, data: student });
    }
    catch (e) {
        next(e);
    }
});
router.delete('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.STUDENT_DELETE), async (req, res, next) => {
    try {
        await Student_1.Student.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { isDeleted: true, deletedAt: new Date() });
        res.json({ success: true, message: 'Student removed' });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=student.routes.js.map