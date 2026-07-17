"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Certificate_1 = require("../models/Certificate");
const CertificateRequest_1 = require("../models/CertificateRequest");
const errorHandler_1 = require("../middleware/errorHandler");
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
// Admin fetches a certificate request
r.get('/requests/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.CERTIFICATE_VIEW), async (req, res, next) => {
    try {
        const request = await CertificateRequest_1.CertificateRequest.findOne({ _id: req.params.id, tenantId: req.user.tenantId }).populate('requestedBy', 'name phone email').lean();
        if (!request)
            throw new errorHandler_1.AppError('Request not found', 404);
        res.json({ success: true, data: request });
    }
    catch (e) {
        next(e);
    }
});
// Admin approves a certificate request
r.post('/requests/:id/approve', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.CERTIFICATE_CREATE), async (req, res, next) => {
    try {
        const request = await CertificateRequest_1.CertificateRequest.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        if (!request)
            throw new errorHandler_1.AppError('Request not found', 404);
        // Generate actual certificate
        const count = await Certificate_1.Certificate.countDocuments({ tenantId: req.user.tenantId });
        const certificateNo = `CERT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
        const cert = await Certificate_1.Certificate.create({
            tenantId: req.user.tenantId,
            certificateNo,
            type: request.type,
            recipientId: request.requestedBy,
            issuedBy: req.user.userId,
            issuedAt: new Date(),
            data: { purpose: request.purpose }
        });
        request.status = 'APPROVED';
        request.certificateId = cert._id;
        await request.save();
        res.json({ success: true, data: cert });
    }
    catch (e) {
        next(e);
    }
});
// Admin rejects a certificate request
r.post('/requests/:id/reject', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.CERTIFICATE_CREATE), async (req, res, next) => {
    try {
        const request = await CertificateRequest_1.CertificateRequest.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        if (!request)
            throw new errorHandler_1.AppError('Request not found', 404);
        request.status = 'REJECTED';
        await request.save();
        res.json({ success: true, message: 'Request rejected' });
    }
    catch (e) {
        next(e);
    }
});
exports.default = r;
//# sourceMappingURL=certificate.routes.js.map