"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Event_1 = require("../models/Event");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.EVENT_VIEW), async (req, res, next) => { try {
    const events = await Event_1.Event.find({ tenantId: req.user.tenantId }).sort({ date: -1 }).lean();
    res.json({ success: true, data: events });
}
catch (e) {
    next(e);
} });
r.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.EVENT_CREATE), async (req, res, next) => { try {
    const e = await Event_1.Event.create({ ...req.body, tenantId: req.user.tenantId });
    res.status(201).json({ success: true, data: e });
}
catch (e) {
    next(e);
} });
r.put('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.EVENT_UPDATE), async (req, res, next) => { try {
    const e = await Event_1.Event.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $set: req.body }, { new: true });
    res.json({ success: true, data: e });
}
catch (e) {
    next(e);
} });
r.post('/:id/register', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.EVENT_VIEW), async (req, res, next) => { try {
    await Event_1.Event.updateOne({ _id: req.params.id, tenantId: req.user.tenantId }, { $push: { registrations: { memberId: req.body.memberId, registeredAt: new Date(), attended: false } } });
    res.json({ success: true });
}
catch (e) {
    next(e);
} });
exports.default = r;
//# sourceMappingURL=event.routes.js.map