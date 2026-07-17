"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Cemetery_1 = require("../models/Cemetery");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.CEMETERY_VIEW), async (req, res, next) => { try {
    const c = await Cemetery_1.Cemetery.findOne({ tenantId: req.user.tenantId }).lean();
    res.json({ success: true, data: c });
}
catch (e) {
    next(e);
} });
r.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.CEMETERY_MANAGE), async (req, res, next) => { try {
    const c = await Cemetery_1.Cemetery.findOneAndUpdate({ tenantId: req.user.tenantId }, { ...req.body, tenantId: req.user.tenantId }, { upsert: true, new: true });
    res.json({ success: true, data: c });
}
catch (e) {
    next(e);
} });
r.post('/plots/occupy', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.CEMETERY_MANAGE), async (req, res, next) => {
    try {
        const { plotNo, deceasedId } = req.body;
        await Cemetery_1.Cemetery.updateOne({ tenantId: req.user.tenantId, 'plots.plotNo': plotNo }, { $set: { 'plots.$.isOccupied': true, 'plots.$.deceasedId': deceasedId, 'plots.$.occupiedAt': new Date() } });
        res.json({ success: true });
    }
    catch (e) {
        next(e);
    }
});
exports.default = r;
//# sourceMappingURL=cemetery.routes.js.map