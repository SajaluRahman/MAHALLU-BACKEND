"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberController = void 0;
const Member_1 = require("../models/Member");
const errorHandler_1 = require("../middleware/errorHandler");
const shared_config_1 = require("@mahallu/shared-config");
const qrcode_1 = __importDefault(require("qrcode"));
class MemberController {
    static async getAll(req, res, next) {
        try {
            const { page = shared_config_1.DEFAULT_PAGINATION.page, limit = shared_config_1.DEFAULT_PAGINATION.limit, search, status, familyId, gender } = req.query;
            const tenantId = req.user.tenantId;
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(parseInt(limit), shared_config_1.DEFAULT_PAGINATION.maxLimit);
            const filter = { tenantId };
            if (status)
                filter.status = status;
            if (familyId)
                filter.familyId = familyId;
            if (gender)
                filter.gender = gender;
            if (search) {
                filter.$text = { $search: search };
            }
            const [members, total] = await Promise.all([
                Member_1.Member.find(filter)
                    .populate('familyId', 'familyCode headMemberId address')
                    .sort({ createdAt: -1 })
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum)
                    .lean(),
                Member_1.Member.countDocuments(filter),
            ]);
            res.status(200).json({
                success: true,
                message: 'Members retrieved',
                data: members,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                    hasNext: pageNum * limitNum < total,
                    hasPrev: pageNum > 1,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const member = await Member_1.Member.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
                .populate('familyId userId')
                .lean();
            if (!member)
                throw new errorHandler_1.AppError('Member not found', 404);
            res.status(200).json({ success: true, message: 'Member found', data: member });
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const tenantId = req.user.tenantId;
            // Generate member ID
            const count = await Member_1.Member.countDocuments({ tenantId });
            const memberId = `MHL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
            // Generate QR code
            const qrData = JSON.stringify({ memberId, tenantId, type: 'member' });
            const qrCode = await qrcode_1.default.toDataURL(qrData);
            const member = await Member_1.Member.create({
                ...req.body,
                tenantId,
                memberId,
                qrCode,
            });
            res.status(201).json({ success: true, message: 'Member created', data: member });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const member = await Member_1.Member.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $set: req.body }, { new: true, runValidators: true });
            if (!member)
                throw new errorHandler_1.AppError('Member not found', 404);
            res.status(200).json({ success: true, message: 'Member updated', data: member });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const member = await Member_1.Member.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
            if (!member)
                throw new errorHandler_1.AppError('Member not found', 404);
            res.status(200).json({ success: true, message: 'Member deleted' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getQRCard(req, res, next) {
        try {
            const member = await Member_1.Member.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
                .populate('familyId', 'address wardNo')
                .lean();
            if (!member)
                throw new errorHandler_1.AppError('Member not found', 404);
            // Generate fresh QR if missing
            if (!member.qrCode) {
                const qrData = JSON.stringify({ memberId: member.memberId, tenantId: member.tenantId, type: 'member' });
                const qrCode = await qrcode_1.default.toDataURL(qrData);
                await Member_1.Member.findByIdAndUpdate(member._id, { qrCode });
                member.qrCode = qrCode;
            }
            res.status(200).json({ success: true, message: 'QR card data', data: member });
        }
        catch (error) {
            next(error);
        }
    }
    static async search(req, res, next) {
        try {
            const { q } = req.query;
            if (!q)
                throw new errorHandler_1.AppError('Search query required', 400);
            const members = await Member_1.Member.find({
                tenantId: req.user.tenantId,
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { phone: { $regex: q, $options: 'i' } },
                    { memberId: { $regex: q, $options: 'i' } },
                    { aadhaarNumber: { $regex: q, $options: 'i' } },
                ],
            }).limit(20).lean();
            res.status(200).json({ success: true, data: members });
        }
        catch (error) {
            next(error);
        }
    }
    static async getStats(req, res, next) {
        try {
            const tenantId = req.user.tenantId;
            const [total, active, inactive, deceased, male, female] = await Promise.all([
                Member_1.Member.countDocuments({ tenantId }),
                Member_1.Member.countDocuments({ tenantId, status: 'active' }),
                Member_1.Member.countDocuments({ tenantId, status: 'inactive' }),
                Member_1.Member.countDocuments({ tenantId, status: 'deceased' }),
                Member_1.Member.countDocuments({ tenantId, gender: 'male' }),
                Member_1.Member.countDocuments({ tenantId, gender: 'female' }),
            ]);
            res.status(200).json({
                success: true,
                data: { total, active, inactive, deceased, male, female },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MemberController = MemberController;
//# sourceMappingURL=member.controller.js.map