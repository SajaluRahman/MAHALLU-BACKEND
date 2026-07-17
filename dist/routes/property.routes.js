"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Property_1 = require("../models/Property");
const Lease_1 = require("../models/Lease");
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
        const p = await Property_1.Property.create({ ...req.body, tenantId: req.user.tenantId, propertyCode });
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
exports.default = r;
//# sourceMappingURL=property.routes.js.map