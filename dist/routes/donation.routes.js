"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Donation_1 = require("../models/Donation");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.DONATION_VIEW), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, campaign } = req.query;
        const pageNum = parseInt(page), limitNum = parseInt(limit);
        const filter = { tenantId: req.user.tenantId };
        if (campaign)
            filter.campaign = campaign;
        const [donations, total] = await Promise.all([
            Donation_1.Donation.find(filter).populate('donorId', 'name phone').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
            Donation_1.Donation.countDocuments(filter),
        ]);
        res.json({ success: true, data: donations, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (e) {
        next(e);
    }
});
r.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.DONATION_CREATE), async (req, res, next) => {
    try {
        const d = await Donation_1.Donation.create({ ...req.body, tenantId: req.user.tenantId });
        res.status(201).json({ success: true, data: d });
    }
    catch (e) {
        next(e);
    }
});
exports.default = r;
//# sourceMappingURL=donation.routes.js.map