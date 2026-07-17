"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Teacher_1 = require("../models/Teacher");
const errorHandler_1 = require("../middleware/errorHandler");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.TEACHER_VIEW), async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page), limitNum = parseInt(limit);
        const [teachers, total] = await Promise.all([
            Teacher_1.Teacher.find({ tenantId: req.user.tenantId }).populate('memberId', 'name photo phone').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
            Teacher_1.Teacher.countDocuments({ tenantId: req.user.tenantId }),
        ]);
        res.json({ success: true, data: teachers, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (e) {
        next(e);
    }
});
r.get('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.TEACHER_VIEW), async (req, res, next) => {
    try {
        const t = await Teacher_1.Teacher.findOne({ _id: req.params.id, tenantId: req.user.tenantId }).populate('memberId madrasaId').lean();
        if (!t)
            throw new errorHandler_1.AppError('Teacher not found', 404);
        res.json({ success: true, data: t });
    }
    catch (e) {
        next(e);
    }
});
r.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.TEACHER_CREATE), async (req, res, next) => {
    try {
        const count = await Teacher_1.Teacher.countDocuments({ tenantId: req.user.tenantId });
        const employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
        const t = await Teacher_1.Teacher.create({ ...req.body, tenantId: req.user.tenantId, employeeId });
        res.status(201).json({ success: true, data: t });
    }
    catch (e) {
        next(e);
    }
});
r.put('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.TEACHER_UPDATE), async (req, res, next) => {
    try {
        const t = await Teacher_1.Teacher.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $set: req.body }, { new: true });
        if (!t)
            throw new errorHandler_1.AppError('Teacher not found', 404);
        res.json({ success: true, data: t });
    }
    catch (e) {
        next(e);
    }
});
exports.default = r;
//# sourceMappingURL=teacher.routes.js.map