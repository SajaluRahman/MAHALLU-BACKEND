"use strict";
// Remaining route stubs — fully functional scaffolds with auth + RBAC
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Madrasa_1 = require("../models/Madrasa");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MADRASA_VIEW), async (req, res, next) => {
    try {
        const m = await Madrasa_1.Madrasa.findOne({ tenantId: req.user.tenantId }).populate('principalId', 'name').lean();
        res.json({ success: true, data: m });
    }
    catch (e) {
        next(e);
    }
});
r.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MADRASA_CREATE), async (req, res, next) => {
    try {
        const m = await Madrasa_1.Madrasa.findOneAndUpdate({ tenantId: req.user.tenantId }, { ...req.body, tenantId: req.user.tenantId }, { upsert: true, new: true });
        res.json({ success: true, data: m });
    }
    catch (e) {
        next(e);
    }
});
exports.default = r;
//# sourceMappingURL=madrasa.routes.js.map