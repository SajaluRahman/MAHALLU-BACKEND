"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Zakat_1 = require("../models/Zakat");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.ZAKAT_VIEW), async (req, res, next) => { try {
    const z = await Zakat_1.Zakat.find({ tenantId: req.user.tenantId }).sort({ year: -1 }).lean();
    res.json({ success: true, data: z });
}
catch (e) {
    next(e);
} });
r.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.ZAKAT_MANAGE), async (req, res, next) => { try {
    const z = await Zakat_1.Zakat.create({ ...req.body, tenantId: req.user.tenantId });
    res.status(201).json({ success: true, data: z });
}
catch (e) {
    next(e);
} });
r.post('/:id/apply', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MEMBER_VIEW), async (req, res, next) => { try {
    const z = await Zakat_1.Zakat.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $push: { applicants: { ...req.body, status: 'pending' } } }, { new: true });
    res.json({ success: true, data: z });
}
catch (e) {
    next(e);
} });
r.patch('/:id/applicants/:memberId', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.ZAKAT_DISTRIBUTE), async (req, res, next) => { try {
    await Zakat_1.Zakat.updateOne({ _id: req.params.id, tenantId: req.user.tenantId, 'applicants.memberId': req.params.memberId }, { $set: { 'applicants.$.status': req.body.status, 'applicants.$.amountApproved': req.body.amountApproved } });
    res.json({ success: true });
}
catch (e) {
    next(e);
} });
exports.default = r;
//# sourceMappingURL=zakat.routes.js.map