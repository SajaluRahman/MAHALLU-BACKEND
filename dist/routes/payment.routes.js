"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPaymentDues = processPaymentDues;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Payment_1 = require("../models/Payment");
const Receipt_1 = require("../models/Receipt");
const errorHandler_1 = require("../middleware/errorHandler");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const shared_types_1 = require("@mahallu/shared-types");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});
// Helper to decrement family balance and mark pending donations as paid
async function processPaymentDues(payment) {
    if (!payment.paidForId)
        return;
    const { Member } = await Promise.resolve().then(() => __importStar(require('../models/Member')));
    const { Family } = await Promise.resolve().then(() => __importStar(require('../models/Family')));
    const { Donation } = await Promise.resolve().then(() => __importStar(require('../models/Donation')));
    const member = await Member.findById(payment.paidForId).lean();
    if (!member?.familyId)
        return;
    let remainingAmount = payment.amount;
    // Find pending donations in chronological order
    const pendingDonations = await Donation.find({
        familyId: member.familyId,
        status: 'pending'
    }).sort({ createdAt: 1 });
    for (const donation of pendingDonations) {
        if (remainingAmount <= 0)
            break;
        if (remainingAmount >= donation.amount) {
            await Donation.findByIdAndUpdate(donation._id, { status: 'paid', paymentId: payment._id });
            remainingAmount -= donation.amount;
        }
        else {
            // Partial payment logic (simplified: just mark it paid or leave it pending with a partial flag)
            // For now, if they pay partially, we won't mark this specific due as completely paid unless it covers it.
            // Or we can just decrement outstanding balance and let the next payment cover it.
        }
    }
    // Decrement the family's outstanding balance
    await Family.findByIdAndUpdate(member.familyId, {
        $inc: { outstandingBalance: -payment.amount }
    });
}
// Create order / Record payment
router.post('/create-order', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.PAYMENT_CREATE), async (req, res, next) => {
    try {
        const { amount, type, paidForId, description, gateway = 'razorpay' } = req.body;
        const tenantId = req.user.tenantId;
        const count = await Payment_1.Payment.countDocuments({ tenantId });
        const paymentNo = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
        if (gateway === 'cash' || gateway === 'bank_transfer' || gateway === 'upi') {
            const payment = await Payment_1.Payment.create({
                tenantId, paymentNo, type, amount,
                paidById: req.user.userId, paidForId,
                gateway,
                status: shared_types_1.PaymentStatus.SUCCESS, description,
            });
            // Auto-generate receipt
            const receiptCount = await Receipt_1.Receipt.countDocuments({ tenantId });
            const receiptNo = `RCP-${new Date().getFullYear()}-${String(receiptCount + 1).padStart(6, '0')}`;
            const receipt = await Receipt_1.Receipt.create({ tenantId, receiptNo, paymentId: payment._id });
            await Payment_1.Payment.findByIdAndUpdate(payment._id, { receiptId: receipt._id });
            await processPaymentDues(payment);
            return res.status(201).json({ success: true, message: 'Payment recorded successfully', data: { payment, receipt } });
        }
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // in paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            notes: { tenantId, type, paidForId, description },
        });
        const payment = await Payment_1.Payment.create({
            tenantId, paymentNo, type, amount,
            paidById: req.user.userId, paidForId,
            gateway: 'razorpay',
            gatewayOrderId: order.id,
            status: 'pending', description,
        });
        res.json({ success: true, data: { order, payment } });
    }
    catch (e) {
        next(e);
    }
});
// Verify payment webhook
router.post('/verify', async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body)
            .digest('hex');
        if (expectedSignature !== razorpay_signature) {
            throw new errorHandler_1.AppError('Invalid payment signature', 400);
        }
        const payment = await Payment_1.Payment.findByIdAndUpdate(paymentId, {
            status: shared_types_1.PaymentStatus.SUCCESS,
            gatewayPaymentId: razorpay_payment_id,
            gatewaySignature: razorpay_signature,
        }, { new: true });
        // Auto-generate receipt
        if (payment) {
            const count = await Receipt_1.Receipt.countDocuments({ tenantId: payment.tenantId });
            const receiptNo = `RCP-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
            const receipt = await Receipt_1.Receipt.create({ tenantId: payment.tenantId, receiptNo, paymentId: payment._id });
            await Payment_1.Payment.findByIdAndUpdate(payment._id, { receiptId: receipt._id });
            await processPaymentDues(payment);
        }
        res.json({ success: true, message: 'Payment verified', data: payment });
    }
    catch (e) {
        next(e);
    }
});
router.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.PAYMENT_VIEW), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, type, status } = req.query;
        const filter = { tenantId: req.user.tenantId };
        if (type)
            filter.type = type;
        if (status)
            filter.status = status;
        const pageNum = parseInt(page), limitNum = parseInt(limit);
        const [payments, total] = await Promise.all([
            Payment_1.Payment.find(filter).populate('paidById paidForId', 'name phone').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
            Payment_1.Payment.countDocuments(filter),
        ]);
        res.json({ success: true, data: payments, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=payment.routes.js.map