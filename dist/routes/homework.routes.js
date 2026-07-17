"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Homework_1 = require("../models/Homework");
const errorHandler_1 = require("../middleware/errorHandler");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.HOMEWORK_VIEW), async (req, res, next) => {
    try {
        const hw = await Homework_1.Homework.find({ tenantId: req.user.tenantId, ...(req.query.classId ? { classId: req.query.classId } : {}) }).populate('teacherId', 'memberId').sort({ dueDate: 1 }).lean();
        res.json({ success: true, data: hw });
    }
    catch (e) {
        next(e);
    }
});
r.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.HOMEWORK_CREATE), async (req, res, next) => {
    try {
        const hw = await Homework_1.Homework.create({ ...req.body, tenantId: req.user.tenantId });
        res.status(201).json({ success: true, data: hw });
    }
    catch (e) {
        next(e);
    }
});
r.post('/:id/submit', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.HOMEWORK_SUBMIT), async (req, res, next) => {
    try {
        const hw = await Homework_1.Homework.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $push: { submissions: { ...req.body, submittedAt: new Date() } } }, { new: true });
        if (!hw)
            throw new errorHandler_1.AppError('Homework not found', 404);
        res.json({ success: true, data: hw });
    }
    catch (e) {
        next(e);
    }
});
r.patch('/:id/grade', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.HOMEWORK_GRADE), async (req, res, next) => {
    try {
        const { studentId, grade, feedback } = req.body;
        await Homework_1.Homework.updateOne({ _id: req.params.id, tenantId: req.user.tenantId, 'submissions.studentId': studentId }, { $set: { 'submissions.$.grade': grade, 'submissions.$.feedback': feedback, 'submissions.$.gradedAt': new Date() } });
        res.json({ success: true, message: 'Graded' });
    }
    catch (e) {
        next(e);
    }
});
exports.default = r;
//# sourceMappingURL=homework.routes.js.map