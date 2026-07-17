import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { PERMISSIONS } from '@mahallu/shared-config';
import { Payment } from '../models/Payment';
import { Receipt } from '../models/Receipt';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PaymentStatus } from '@mahallu/shared-types';

const router = Router();
router.use(authenticate);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// Helper to decrement family balance and mark pending donations as paid
export async function processPaymentDues(payment: any) {
  if (!payment.paidForId) return;

  const { Member } = await import('../models/Member');
  const { Family } = await import('../models/Family');
  const { Donation } = await import('../models/Donation');

  const member = await Member.findById(payment.paidForId).lean();
  if (!member?.familyId) return;

  let remainingAmount = payment.amount;

  // Find pending donations in chronological order
  const pendingDonations = await Donation.find({
    familyId: member.familyId,
    status: 'pending'
  }).sort({ createdAt: 1 });

  for (const donation of pendingDonations) {
    if (remainingAmount <= 0) break;

    if (remainingAmount >= donation.amount) {
      await Donation.findByIdAndUpdate(donation._id, { status: 'paid', paymentId: payment._id });
      remainingAmount -= donation.amount;
    } else {
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
router.post('/create-order', authorize(PERMISSIONS.PAYMENT_CREATE), async (req: AuthRequest, res, next) => {
  try {
    const { amount, type, paidForId, description, gateway = 'razorpay' } = req.body;
    const tenantId = req.user!.tenantId;

    const count = await Payment.countDocuments({ tenantId });
    const paymentNo = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    if (gateway === 'cash' || gateway === 'bank_transfer' || gateway === 'upi') {
      const payment = await Payment.create({
        tenantId, paymentNo, type, amount,
        paidById: req.user!.userId, paidForId,
        gateway,
        status: PaymentStatus.SUCCESS, description,
      });

      // Auto-generate receipt
      const receiptCount = await Receipt.countDocuments({ tenantId });
      const receiptNo = `RCP-${new Date().getFullYear()}-${String(receiptCount + 1).padStart(6, '0')}`;
      const receipt = await Receipt.create({ tenantId, receiptNo, paymentId: payment._id });
      await Payment.findByIdAndUpdate(payment._id, { receiptId: receipt._id });

      await processPaymentDues(payment);

      return res.status(201).json({ success: true, message: 'Payment recorded successfully', data: { payment, receipt } });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { tenantId, type, paidForId, description },
    });

    const payment = await Payment.create({
      tenantId, paymentNo, type, amount,
      paidById: req.user!.userId, paidForId,
      gateway: 'razorpay',
      gatewayOrderId: order.id,
      status: 'pending', description,
    });

    res.json({ success: true, data: { order, payment } });
  } catch (e) { next(e); }
});

// Verify payment webhook
router.post('/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new AppError('Invalid payment signature', 400);
    }

    const payment = await Payment.findByIdAndUpdate(paymentId, {
      status: PaymentStatus.SUCCESS,
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
    }, { new: true });

    // Auto-generate receipt
    if (payment) {
      const count = await Receipt.countDocuments({ tenantId: payment.tenantId });
      const receiptNo = `RCP-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
      const receipt = await Receipt.create({ tenantId: payment.tenantId, receiptNo, paymentId: payment._id });
      await Payment.findByIdAndUpdate(payment._id, { receiptId: receipt._id });
      
      await processPaymentDues(payment);
    }

    res.json({ success: true, message: 'Payment verified', data: payment });
  } catch (e) { next(e); }
});

router.get('/', authorize(PERMISSIONS.PAYMENT_VIEW), async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const filter: Record<string, unknown> = { tenantId: req.user!.tenantId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    const pageNum = parseInt(page as string), limitNum = parseInt(limit as string);
    const [payments, total] = await Promise.all([
      Payment.find(filter).populate('paidById paidForId', 'name phone').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Payment.countDocuments(filter),
    ]);
    res.json({ success: true, data: payments, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  } catch (e) { next(e); }
});

export default router;
