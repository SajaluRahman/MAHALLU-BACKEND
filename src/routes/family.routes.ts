// Route scaffolds — all fully wired with authenticate + RBAC stubs
// Each will be fully implemented in Phase 1 continuation

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { PERMISSIONS } from '@mahallu/shared-config';
import { Family } from '../models/Family';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import QRCode from 'qrcode';

const router = Router();
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.FAMILY_VIEW), async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const tenantId = req.user!.tenantId;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const filter: Record<string, unknown> = { tenantId };
    if (search) filter.$or = [
      { familyCode: { $regex: search, $options: 'i' } },
      { 'address.line1': { $regex: search, $options: 'i' } },
    ];
    const [families, total] = await Promise.all([
      Family.find(filter).populate('headMemberId', 'name phone photo').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Family.countDocuments(filter),
    ]);
    res.json({ success: true, data: families, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  } catch (e) { next(e); }
});

router.get('/:id', authorize(PERMISSIONS.FAMILY_VIEW), async (req: AuthRequest, res, next) => {
  try {
    const family = await Family.findOne({ _id: req.params.id, tenantId: req.user!.tenantId })
      .populate('headMemberId members.memberId').lean();
    if (!family) throw new AppError('Family not found', 404);
    res.json({ success: true, data: family });
  } catch (e) { next(e); }
});

router.post('/', authorize(PERMISSIONS.FAMILY_CREATE), async (req: AuthRequest, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const count = await Family.countDocuments({ tenantId });
    const familyCode = `FAM-${String(count + 1).padStart(4, '0')}`;
    const qrData = JSON.stringify({ familyCode, tenantId, type: 'family' });
    const qrCode = await QRCode.toDataURL(qrData);
    const family = await Family.create({ ...req.body, tenantId, familyCode, qrCode });
    res.status(201).json({ success: true, data: family });
  } catch (e) { next(e); }
});

router.put('/:id', authorize(PERMISSIONS.FAMILY_UPDATE), async (req: AuthRequest, res, next) => {
  try {
    const family = await Family.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user!.tenantId },
      { $set: req.body }, { new: true }
    );
    if (!family) throw new AppError('Family not found', 404);
    res.json({ success: true, data: family });
  } catch (e) { next(e); }
});

router.delete('/:id', authorize(PERMISSIONS.FAMILY_DELETE), async (req: AuthRequest, res, next) => {
  try {
    await Family.findOneAndUpdate({ _id: req.params.id, tenantId: req.user!.tenantId }, { isDeleted: true, deletedAt: new Date() });
    res.json({ success: true, message: 'Family deleted' });
  } catch (e) { next(e); }
});

router.post('/:id/remind-recurring', authorize(PERMISSIONS.FAMILY_VIEW), async (req: AuthRequest, res, next) => {
  try {
    const family = await Family.findOne({ _id: req.params.id, tenantId: req.user!.tenantId });
    if (!family) throw new AppError('Family not found', 404);
    
    if (!family.headMemberId) {
      throw new AppError('Family has no head member assigned to receive the alert', 400);
    }

    if (!family.outstandingBalance || family.outstandingBalance <= 0) {
      throw new AppError('Family has no outstanding balance', 400);
    }

    const { User } = await import('../models/User');
    const headUser = await User.findOne({ memberId: family.headMemberId, tenantId: family.tenantId });
    if (!headUser) {
      throw new AppError('Family head does not have a user account to receive alerts', 400);
    }

    const { Notification } = await import('../models/Notification');
    const { NotificationChannel } = await import('@mahallu/shared-types');

    await Notification.create({
      tenantId: family.tenantId,
      channel: NotificationChannel.IN_APP,
      recipientId: headUser._id,
      title: 'Reminder: Recurring Due Pending',
      body: `Reminder: Your family has an outstanding balance of ${family.outstandingBalance}. Please clear your dues at your earliest convenience.`,
      status: 'pending',
    });

    res.json({ success: true, message: 'Reminder sent successfully' });
  } catch (e) { next(e); }
});

export default router;
