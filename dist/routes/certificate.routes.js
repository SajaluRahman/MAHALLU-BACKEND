"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Certificate_1 = require("../models/Certificate");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.CERTIFICATE_VIEW), async (req, res, next) => { try {
    const certs = await Certificate_1.Certificate.find({ tenantId: req.user.tenantId }).populate('recipientId', 'name').sort({ issuedAt: -1 }).lean();
    res.json({ success: true, data: certs });
}
catch (e) {
    next(e);
} });
r.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.CERTIFICATE_CREATE), async (req, res, next) => {
    try {
        const count = await Certificate_1.Certificate.countDocuments({ tenantId: req.user.tenantId });
        const certificateNo = `CERT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
        const cert = await Certificate_1.Certificate.create({ ...req.body, tenantId: req.user.tenantId, certificateNo, issuedBy: req.user.userId, issuedAt: new Date() });
        res.status(201).json({ success: true, data: cert });
    }
    catch (e) {
        next(e);
    }
});
exports.default = r;
//# sourceMappingURL=certificate.routes.js.map