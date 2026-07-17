"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const RegistrationRequest_1 = require("../models/RegistrationRequest");
const PlotRequest_1 = require("../models/PlotRequest");
const CertificateRequest_1 = require("../models/CertificateRequest");
const RentalRequest_1 = require("../models/RentalRequest");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId;
        const statusQuery = req.query.status || 'PENDING';
        let regStatusQuery = { $in: [RegistrationRequest_1.RegistrationStatus.PENDING, RegistrationRequest_1.RegistrationStatus.APPROVED, RegistrationRequest_1.RegistrationStatus.REJECTED] };
        let genStatusQuery = { $in: ['pending', 'approved', 'rejected', 'PENDING', 'APPROVED', 'REJECTED'] };
        if (statusQuery !== 'ALL') {
            regStatusQuery = statusQuery.toUpperCase();
            genStatusQuery = statusQuery.toLowerCase();
            if (statusQuery === 'PENDING' || statusQuery === 'APPROVED' || statusQuery === 'REJECTED') {
                genStatusQuery = { $in: [statusQuery.toLowerCase(), statusQuery.toUpperCase()] };
            }
        }
        // Fetch registration requests
        const registrations = await RegistrationRequest_1.RegistrationRequest.find({ tenantId, status: regStatusQuery })
            .sort({ createdAt: -1 })
            .lean();
        // Fetch plot requests
        const plots = await PlotRequest_1.PlotRequest.find({ tenantId, status: genStatusQuery })
            .populate('requestedBy', 'name')
            .populate('cemeteryId', 'name')
            .sort({ createdAt: -1 })
            .lean();
        // Fetch certificate requests
        const certs = await CertificateRequest_1.CertificateRequest.find({ tenantId, status: genStatusQuery })
            .populate('requestedBy', 'name')
            .sort({ createdAt: -1 })
            .lean();
        // Fetch rental requests
        const rentals = await RentalRequest_1.RentalRequest.find({ tenantId, status: genStatusQuery })
            .populate('requestedBy', 'name phone')
            .populate('propertyId', 'name propertyCode')
            .sort({ createdAt: -1 })
            .lean();
        // Format them into a unified inbox format
        const inboxItems = [];
        registrations.forEach(reg => {
            inboxItems.push({
                id: reg._id,
                type: 'REGISTRATION',
                title: `New ${reg.type.toLowerCase()} registration request`,
                description: `Name: ${reg.payload?.name || 'Unknown'}\nPhone: ${reg.payload?.phone || 'Unknown'}`,
                createdAt: reg.createdAt,
                status: reg.status,
                actionUrl: '/registrations',
            });
        });
        plots.forEach(plot => {
            inboxItems.push({
                id: plot._id,
                type: 'PLOT_REQUEST',
                title: `Cemetery Plot Request`,
                description: `Plot ${plot.plotNo} requested by ${plot.requestedBy?.name || 'Unknown'} in ${plot.cemeteryId?.name || 'Unknown'}`,
                createdAt: plot.createdAt,
                status: plot.status.toUpperCase(),
                actionUrl: '/cemetery',
            });
        });
        certs.forEach(cert => {
            inboxItems.push({
                id: cert._id,
                type: 'CERTIFICATE_REQUEST',
                title: `${(cert.type || '').toUpperCase()} Certificate Request`,
                description: `Requested by ${cert.requestedBy?.name || 'Unknown'}\nPurpose: ${cert.purpose}`,
                createdAt: cert.createdAt,
                status: cert.status.toUpperCase(),
                actionUrl: `/certificates/requests/${cert._id}`,
            });
        });
        rentals.forEach(rent => {
            inboxItems.push({
                id: rent._id,
                type: 'RENTAL_REQUEST',
                title: `Property / Equipment Rental Request`,
                description: `Requested by ${rent.requestedBy?.name || 'Unknown'}\nItem: ${rent.propertyId?.name || 'Unknown'}\nQuantity: ${rent.quantityRequested}`,
                createdAt: rent.createdAt,
                status: rent.status.toUpperCase(),
                actionUrl: `/properties/requests/${rent._id}`,
            });
        });
        // Sort all items chronologically (newest first)
        inboxItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.json({ success: true, data: inboxItems });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=inbox.routes.js.map