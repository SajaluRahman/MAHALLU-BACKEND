"use strict";
// Route scaffolds — all fully wired with authenticate + RBAC stubs
// Each will be fully implemented in Phase 1 continuation
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
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Family_1 = require("../models/Family");
const errorHandler_1 = require("../middleware/errorHandler");
const qrcode_1 = __importDefault(require("qrcode"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.FAMILY_VIEW), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const tenantId = req.user.tenantId;
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100);
        const filter = { tenantId };
        if (search)
            filter.$or = [
                { familyCode: { $regex: search, $options: 'i' } },
                { 'address.line1': { $regex: search, $options: 'i' } },
            ];
        const [families, total] = await Promise.all([
            Family_1.Family.find(filter).populate('headMemberId', 'name phone photo').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
            Family_1.Family.countDocuments(filter),
        ]);
        res.json({ success: true, data: families, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (e) {
        next(e);
    }
});
router.get('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.FAMILY_VIEW), async (req, res, next) => {
    try {
        const family = await Family_1.Family.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
            .populate('headMemberId members.memberId').lean();
        if (!family)
            throw new errorHandler_1.AppError('Family not found', 404);
        res.json({ success: true, data: family });
    }
    catch (e) {
        next(e);
    }
});
router.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.FAMILY_CREATE), async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId;
        const count = await Family_1.Family.countDocuments({ tenantId });
        const familyCode = `FAM-${String(count + 1).padStart(4, '0')}`;
        const qrData = JSON.stringify({ familyCode, tenantId, type: 'family' });
        const qrCode = await qrcode_1.default.toDataURL(qrData);
        const family = await Family_1.Family.create({ ...req.body, tenantId, familyCode, qrCode });
        res.status(201).json({ success: true, data: family });
    }
    catch (e) {
        next(e);
    }
});
router.put('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.FAMILY_UPDATE), async (req, res, next) => {
    try {
        const family = await Family_1.Family.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $set: req.body }, { new: true });
        if (!family)
            throw new errorHandler_1.AppError('Family not found', 404);
        res.json({ success: true, data: family });
    }
    catch (e) {
        next(e);
    }
});
router.delete('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.FAMILY_DELETE), async (req, res, next) => {
    try {
        await Family_1.Family.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { isDeleted: true, deletedAt: new Date() });
        res.json({ success: true, message: 'Family deleted' });
    }
    catch (e) {
        next(e);
    }
});
router.post('/:id/remind-recurring', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.FAMILY_VIEW), async (req, res, next) => {
    try {
        const family = await Family_1.Family.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        if (!family)
            throw new errorHandler_1.AppError('Family not found', 404);
        if (!family.headMemberId) {
            throw new errorHandler_1.AppError('Family has no head member assigned to receive the alert', 400);
        }
        if (!family.outstandingBalance || family.outstandingBalance <= 0) {
            throw new errorHandler_1.AppError('Family has no outstanding balance', 400);
        }
        const { User } = await Promise.resolve().then(() => __importStar(require('../models/User')));
        const headUser = await User.findOne({ memberId: family.headMemberId, tenantId: family.tenantId });
        if (!headUser) {
            throw new errorHandler_1.AppError('Family head does not have a user account to receive alerts', 400);
        }
        const { Notification } = await Promise.resolve().then(() => __importStar(require('../models/Notification')));
        const { NotificationChannel } = await Promise.resolve().then(() => __importStar(require('@mahallu/shared-types')));
        await Notification.create({
            tenantId: family.tenantId,
            channel: NotificationChannel.IN_APP,
            recipientId: headUser._id,
            title: 'Reminder: Recurring Due Pending',
            body: `Reminder: Your family has an outstanding balance of ${family.outstandingBalance}. Please clear your dues at your earliest convenience.`,
            status: 'pending',
        });
        res.json({ success: true, message: 'Reminder sent successfully' });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=family.routes.js.map