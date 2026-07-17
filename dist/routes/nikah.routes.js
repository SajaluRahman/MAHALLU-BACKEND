"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Nikah_1 = require("../models/Nikah");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.NIKAH_VIEW), async (req, res, next) => { try {
    const records = await Nikah_1.Nikah.find({ tenantId: req.user.tenantId }).sort({ date: -1 }).lean();
    res.json({ success: true, data: records });
}
catch (e) {
    next(e);
} });
r.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.NIKAH_REGISTER), async (req, res, next) => {
    try {
        const count = await Nikah_1.Nikah.countDocuments({ tenantId: req.user.tenantId });
        const nikahNo = `NKH-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        const n = await Nikah_1.Nikah.create({ ...req.body, tenantId: req.user.tenantId, nikahNo });
        res.status(201).json({ success: true, data: n });
    }
    catch (e) {
        next(e);
    }
});
exports.default = r;
//# sourceMappingURL=nikah.routes.js.map