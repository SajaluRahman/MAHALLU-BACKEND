"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Certificate_1 = require("../models/Certificate");
const CertificateRequest_1 = require("../models/CertificateRequest");
const errorHandler_1 = require("../middleware/errorHandler");
const shared_types_1 = require("@mahallu/shared-types");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
// Admin fetches all issued certificates
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.CERTIFICATE_VIEW), async (req, res, next) => {
    try {
        const certs = await Certificate_1.Certificate.find({ tenantId: req.user.tenantId })
            .populate('recipientId', 'name memberId phone email relationship')
            .populate('issuedBy', 'name role')
            .sort({ issuedAt: -1 })
            .lean();
        res.json({ success: true, data: certs });
    }
    catch (e) {
        next(e);
    }
});
// Admin fetches all certificate requests
r.get('/requests', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.CERTIFICATE_VIEW), async (req, res, next) => {
    try {
        const status = req.query.status;
        const query = { tenantId: req.user.tenantId };
        if (status)
            query.status = status;
        const requests = await CertificateRequest_1.CertificateRequest.find(query)
            .populate('requestedBy', 'name memberId phone email relationship familyId')
            .populate('certificateId')
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: requests });
    }
    catch (e) {
        next(e);
    }
});
// Admin fetches a single certificate request
r.get('/requests/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.CERTIFICATE_VIEW), async (req, res, next) => {
    try {
        const request = await CertificateRequest_1.CertificateRequest.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
            .populate('requestedBy', 'name memberId phone email relationship familyId')
            .populate('certificateId')
            .lean();
        if (!request)
            throw new errorHandler_1.AppError('Request not found', 404);
        res.json({ success: true, data: request });
    }
    catch (e) {
        next(e);
    }
});
// Admin approves a certificate request with template selection, verified details, E-Sign & E-Stamp
r.post('/requests/:id/approve', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.CERTIFICATE_CREATE), async (req, res, next) => {
    try {
        const request = await CertificateRequest_1.CertificateRequest.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        if (!request)
            throw new errorHandler_1.AppError('Request not found', 404);
        const { type, details, eSign, eStamp, customCertificateNo } = req.body;
        // Generate actual certificate
        const count = await Certificate_1.Certificate.countDocuments({ tenantId: req.user.tenantId });
        const certificateNo = customCertificateNo || `CERT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
        const certType = type || request.type || shared_types_1.CertificateType.RESIDENCE;
        const certDetails = {
            ...(request.details || {}),
            ...(details || {}),
            purpose: request.purpose,
        };
        const cert = await Certificate_1.Certificate.create({
            tenantId: req.user.tenantId,
            certificateNo,
            type: certType,
            recipientId: request.requestedBy,
            issuedBy: req.user.userId,
            issuedAt: new Date(),
            data: certDetails,
            eSign: {
                isSigned: eSign?.isSigned ?? true,
                signedBy: eSign?.signedBy || 'Secretary, Mahallu Committee',
                designation: eSign?.designation || 'Authorized Signatory',
            },
            eStamp: {
                isStamped: eStamp?.isStamped ?? true,
                sealTitle: eStamp?.sealTitle || 'Official Seal of Mahallu Committee',
            },
        });
        request.status = 'APPROVED';
        request.certificateId = cert._id;
        if (type)
            request.type = type;
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
        if (req.body.notes)
            request.notes = req.body.notes;
        await request.save();
        res.json({ success: true, message: 'Request rejected' });
    }
    catch (e) {
        next(e);
    }
});
// Get single issued certificate details by ID
r.get('/:id', async (req, res, next) => {
    try {
        const cert = await Certificate_1.Certificate.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
            .populate('recipientId', 'name memberId phone email relationship familyId address')
            .populate('issuedBy', 'name role')
            .populate('tenantId', 'name code address logo')
            .lean();
        if (!cert)
            throw new errorHandler_1.AppError('Certificate not found', 404);
        res.json({ success: true, data: cert });
    }
    catch (e) {
        next(e);
    }
});
exports.default = r;
//# sourceMappingURL=certificate.routes.js.map