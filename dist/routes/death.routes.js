"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const DeathRecord_1 = require("../models/DeathRecord");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.DEATH_VIEW), async (req, res, next) => { try {
    const records = await DeathRecord_1.DeathRecord.find({ tenantId: req.user.tenantId }).populate('memberId', 'name photo').sort({ dateOfDeath: -1 }).lean();
    res.json({ success: true, data: records });
}
catch (e) {
    next(e);
} });
r.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.DEATH_CREATE), async (req, res, next) => { try {
    const d = await DeathRecord_1.DeathRecord.create({ ...req.body, tenantId: req.user.tenantId });
    res.status(201).json({ success: true, data: d });
}
catch (e) {
    next(e);
} });
exports.default = r;
//# sourceMappingURL=death.routes.js.map