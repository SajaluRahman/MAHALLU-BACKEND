"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Transaction_1 = require("../models/Transaction");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/v1/finance/transactions
router.get('/transactions', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.FINANCE_VIEW), async (req, res, next) => {
    try {
        const { year } = req.query;
        const query = { tenantId: req.user.tenantId };
        if (year) {
            const startDate = new Date(`${year}-01-01T00:00:00Z`);
            const endDate = new Date(`${year}-12-31T23:59:59Z`);
            query.date = { $gte: startDate, $lte: endDate };
        }
        const transactions = await Transaction_1.Transaction.find(query)
            .sort({ date: -1, createdAt: -1 })
            .populate('recordedBy', 'name')
            .lean();
        res.json({ success: true, data: transactions });
    }
    catch (e) {
        next(e);
    }
});
// POST /api/v1/finance/transactions
router.post('/transactions', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.FINANCE_CREATE), async (req, res, next) => {
    try {
        const { type, amount, category, date, description, referenceNo } = req.body;
        if (!type || !amount || !category || !date || !description) {
            throw new errorHandler_1.AppError('Missing required fields', 400);
        }
        const transaction = await Transaction_1.Transaction.create({
            tenantId: req.user.tenantId,
            type,
            amount,
            category,
            date: new Date(date),
            description,
            referenceNo,
            recordedBy: req.user.userId
        });
        res.status(201).json({ success: true, data: transaction });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=finance.routes.js.map