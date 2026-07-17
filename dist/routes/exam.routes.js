"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Exam_1 = require("../models/Exam");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.EXAM_VIEW), async (req, res, next) => { try {
    const exams = await Exam_1.Exam.find({ tenantId: req.user.tenantId, ...(req.query.classId ? { classId: req.query.classId } : {}) }).sort({ date: -1 }).lean();
    res.json({ success: true, data: exams });
}
catch (e) {
    next(e);
} });
r.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.EXAM_CREATE), async (req, res, next) => { try {
    const exam = await Exam_1.Exam.create({ ...req.body, tenantId: req.user.tenantId });
    res.status(201).json({ success: true, data: exam });
}
catch (e) {
    next(e);
} });
r.put('/:id/results', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.EXAM_GRADE), async (req, res, next) => { try {
    const exam = await Exam_1.Exam.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $set: { results: req.body.results, isPublished: req.body.isPublished } }, { new: true });
    res.json({ success: true, data: exam });
}
catch (e) {
    next(e);
} });
exports.default = r;
//# sourceMappingURL=exam.routes.js.map