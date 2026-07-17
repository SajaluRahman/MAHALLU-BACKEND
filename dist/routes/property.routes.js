"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Property_1 = require("../models/Property");
const Lease_1 = require("../models/Lease");
const RentalRequest_1 = require("../models/RentalRequest");
const errorHandler_1 = require("../middleware/errorHandler");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.PROPERTY_VIEW), async (req, res, next) => { try {
    const props = await Property_1.Property.find({ tenantId: req.user.tenantId }).lean();
    res.json({ success: true, data: props });
}
catch (e) {
    next(e);
} });
r.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.PROPERTY_CREATE), async (req, res, next) => {
    try {
        const count = await Property_1.Property.countDocuments({ tenantId: req.user.tenantId });
        const propertyCode = `PROP-${String(count + 1).padStart(4, '0')}`;
        // Default availableQuantity to total quantity if it's equipment
        const payload = { ...req.body };
        if (payload.type === 'equipment' && payload.quantity !== undefined) {
            payload.availableQuantity = payload.quantity;
        }
        const p = await Property_1.Property.create({ ...payload, tenantId: req.user.tenantId, propertyCode });
        res.status(201).json({ success: true, data: p });
    }
    catch (e) {
        next(e);
    }
});
r.get('/:id/leases', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.PROPERTY_VIEW), async (req, res, next) => { try {
    const leases = await Lease_1.Lease.find({ tenantId: req.user.tenantId, propertyId: req.params.id }).populate('tenantMemberId', 'name phone').lean();
    res.json({ success: true, data: leases });
}
catch (e) {
    next(e);
} });
r.post('/:id/leases', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.PROPERTY_UPDATE), async (req, res, next) => {
    try {
        const lease = await Lease_1.Lease.create({ ...req.body, tenantId: req.user.tenantId, propertyId: req.params.id });
        await Property_1.Property.findByIdAndUpdate(req.params.id, { currentLeaseId: lease._id, status: 'occupied' });
        res.status(201).json({ success: true, data: lease });
    }
    catch (e) {
        next(e);
    }
});
// Admin fetches all rental requests
r.get('/requests', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.PROPERTY_VIEW), async (req, res, next) => {
    try {
        const requests = await RentalRequest_1.RentalRequest.find({ tenantId: req.user.tenantId })
            .populate('requestedBy', 'name phone')
            .populate('propertyId', 'name type')
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: requests });
    }
    catch (e) {
        next(e);
    }
});
// Admin fetches a single rental request
r.get('/requests/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.PROPERTY_VIEW), async (req, res, next) => {
    try {
        const request = await RentalRequest_1.RentalRequest.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
            .populate('requestedBy', 'name phone email')
            .populate('propertyId', 'name propertyCode type quantity availableQuantity')
            .lean();
        if (!request)
            throw new errorHandler_1.AppError('Request not found', 404);
        res.json({ success: true, data: request });
    }
    catch (e) {
        next(e);
    }
});
// Admin approves a rental request
r.post('/requests/:id/approve', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.PROPERTY_UPDATE), async (req, res, next) => {
    try {
        const request = await RentalRequest_1.RentalRequest.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        if (!request)
            throw new errorHandler_1.AppError('Request not found', 404);
        if (request.status !== 'PENDING') {
            throw new errorHandler_1.AppError('Request is already processed', 400);
        }
        const property = await Property_1.Property.findOne({ _id: request.propertyId, tenantId: req.user.tenantId });
        if (property && property.type === 'equipment') {
            if ((property.availableQuantity || 0) < request.quantityRequested) {
                throw new errorHandler_1.AppError('Not enough quantity available', 400);
            }
            property.availableQuantity = (property.availableQuantity || 0) - request.quantityRequested;
            await property.save();
        }
        request.status = 'APPROVED';
        await request.save();
        res.json({ success: true, data: request });
    }
    catch (e) {
        next(e);
    }
});
// Admin rejects a rental request
r.post('/requests/:id/reject', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.PROPERTY_UPDATE), async (req, res, next) => {
    try {
        const request = await RentalRequest_1.RentalRequest.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
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
r.get('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.PROPERTY_VIEW), async (req, res, next) => {
    try {
        const prop = await Property_1.Property.findOne({ _id: req.params.id, tenantId: req.user.tenantId }).populate('currentLeaseId').lean();
        if (!prop)
            throw new errorHandler_1.AppError('Property not found', 404);
        res.json({ success: true, data: prop });
    }
    catch (e) {
        next(e);
    }
});
r.put('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.PROPERTY_UPDATE), async (req, res, next) => {
    try {
        const existing = await Property_1.Property.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        if (!existing)
            throw new errorHandler_1.AppError('Property not found', 404);
        const payload = { ...req.body };
        if (payload.type === 'equipment' && payload.quantity !== undefined) {
            const diff = payload.quantity - (existing.quantity || 0);
            payload.availableQuantity = (existing.availableQuantity || 0) + diff;
        }
        const prop = await Property_1.Property.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, payload, { new: true, runValidators: true });
        res.json({ success: true, data: prop });
    }
    catch (e) {
        next(e);
    }
});
exports.default = r;
//# sourceMappingURL=property.routes.js.map