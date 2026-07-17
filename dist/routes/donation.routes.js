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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Donation_1 = require("../models/Donation");
const Family_1 = require("../models/Family");
const User_1 = require("../models/User");
const Notification_1 = require("../models/Notification");
const shared_types_1 = require("@mahallu/shared-types");
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
            Donation_1.Donation.find(filter).populate('donorId', 'name phone').populate({ path: 'familyId', select: 'familyCode headMemberId', populate: { path: 'headMemberId', select: 'name' } }).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
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
        const { amount, campaign, familyId, donorName, isAnonymous, gateway } = req.body;
        const tenantId = req.user.tenantId;
        const isFamilyDue = !!familyId && !gateway; // If familyId is provided but no gateway, it's a pending due.
        const d = await Donation_1.Donation.create({
            tenantId,
            amount,
            campaign,
            familyId: familyId || undefined,
            donorName,
            isAnonymous,
            status: isFamilyDue ? 'pending' : 'paid'
        });
        if (isFamilyDue) {
            // Find the family and increment its outstanding balance
            const family = await Family_1.Family.findOneAndUpdate({ _id: familyId, tenantId }, { $inc: { outstandingBalance: amount } }, { new: true });
            if (family && family.headMemberId) {
                // Find the user account for the family head
                const headUser = await User_1.User.findOne({ memberId: family.headMemberId, tenantId });
                if (headUser) {
                    // Create in-app notification
                    await Notification_1.Notification.create({
                        tenantId,
                        channel: shared_types_1.NotificationChannel.IN_APP,
                        recipientId: headUser._id,
                        title: 'New Due Added',
                        body: `A new due of ${amount} for ${campaign || 'General Donation'} has been added to your family account. Please pay at your earliest convenience.`,
                        status: 'pending',
                    });
                }
            }
        }
        else if (gateway) {
            // If payment is collected immediately (Cash / GPay)
            const { Payment } = await Promise.resolve().then(() => __importStar(require('../models/Payment')));
            const { Receipt } = await Promise.resolve().then(() => __importStar(require('../models/Receipt')));
            const count = await Payment.countDocuments({ tenantId });
            const paymentNo = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
            // Resolve who is paying
            let paidById = req.user.userId; // Default to admin recording it
            if (familyId) {
                const family = await Family_1.Family.findById(familyId).lean();
                if (family && family.headMemberId) {
                    paidById = family.headMemberId;
                }
            }
            const payment = await Payment.create({
                tenantId, paymentNo, type: 'donation', amount,
                paidById,
                paidForId: familyId ? paidById : undefined,
                gateway: gateway.toLowerCase(),
                status: 'success', description: campaign || 'Direct Donation',
            });
            const receiptCount = await Receipt.countDocuments({ tenantId });
            const receiptNo = `RCP-${new Date().getFullYear()}-${String(receiptCount + 1).padStart(6, '0')}`;
            const receipt = await Receipt.create({ tenantId, receiptNo, paymentId: payment._id });
            await Payment.findByIdAndUpdate(payment._id, { receiptId: receipt._id });
            // Link donation to payment
            d.paymentId = payment._id;
            await d.save();
            // If familyId was provided, also decrement the balance since they paid instantly
            // (Actually, if they pay instantly, it doesn't affect outstandingBalance, but just in case, we don't increment it)
        }
        res.status(201).json({ success: true, data: d });
    }
    catch (e) {
        next(e);
    }
});
r.post('/:id/collect', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.DONATION_CREATE), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { gateway = 'cash', amount, description } = req.body;
        const tenantId = req.user.tenantId;
        const donation = await Donation_1.Donation.findOne({ _id: id, tenantId });
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }
        if (donation.status === 'paid' || !donation.status) {
            return res.status(400).json({ success: false, message: 'Donation is already paid' });
        }
        const collectAmount = amount || donation.amount;
        const { Payment } = await Promise.resolve().then(() => __importStar(require('../models/Payment')));
        const { Receipt } = await Promise.resolve().then(() => __importStar(require('../models/Receipt')));
        const count = await Payment.countDocuments({ tenantId });
        const paymentNo = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
        // Resolve who is paying
        let paidById = req.user.userId;
        if (donation.familyId) {
            const family = await Family_1.Family.findById(donation.familyId).lean();
            if (family && family.headMemberId) {
                paidById = family.headMemberId;
            }
        }
        else if (donation.donorId) {
            paidById = donation.donorId;
        }
        const payment = await Payment.create({
            tenantId, paymentNo, type: 'donation', amount: collectAmount,
            paidById,
            paidForId: donation.familyId ? paidById : undefined,
            gateway: gateway.toLowerCase(),
            status: 'success', description: description || donation.campaign || 'Collected Donation Dues',
        });
        const receiptCount = await Receipt.countDocuments({ tenantId });
        const receiptNo = `RCP-${new Date().getFullYear()}-${String(receiptCount + 1).padStart(6, '0')}`;
        const receipt = await Receipt.create({ tenantId, receiptNo, paymentId: payment._id });
        await Payment.findByIdAndUpdate(payment._id, { receiptId: receipt._id });
        // Mark donation as paid
        donation.status = 'paid';
        donation.paymentId = payment._id;
        await donation.save();
        // Decrement the family's outstanding balance
        if (donation.familyId) {
            await Family_1.Family.findByIdAndUpdate(donation.familyId, {
                $inc: { outstandingBalance: -collectAmount }
            });
        }
        res.json({ success: true, message: 'Donation collected successfully', data: { donation, payment, receipt } });
    }
    catch (e) {
        next(e);
    }
});
exports.default = r;
//# sourceMappingURL=donation.routes.js.map