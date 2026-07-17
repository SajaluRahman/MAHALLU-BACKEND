import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';
import { Survey } from '../models/Survey';
import { Receipt } from '../models/Receipt';
import { Settings } from '../models/Settings';
import { AuthRequest } from '../middleware/auth';

// --- Notification Routes ---
export const notificationRoutes = (() => {
  const r = Router();
  r.use(authenticate);
  r.get('/', async (req: AuthRequest, res, next) => { try { const n = await Notification.find({ tenantId: req.user!.tenantId }).sort({ createdAt: -1 }).limit(50).lean(); res.json({ success: true, data: n }); } catch (e) { next(e); } });
  r.post('/', async (req: AuthRequest, res, next) => { try { const n = await Notification.create({ ...req.body, tenantId: req.user!.tenantId }); res.status(201).json({ success: true, data: n }); } catch (e) { next(e); } });
  return r;
})();

// --- Survey Routes ---
export const surveyRoutes = (() => {
  const r = Router();
  r.use(authenticate);
  r.get('/', async (req: AuthRequest, res, next) => { try { const s = await Survey.find({ tenantId: req.user!.tenantId }).lean(); res.json({ success: true, data: s }); } catch (e) { next(e); } });
  r.post('/', async (req: AuthRequest, res, next) => { try { const s = await Survey.create({ ...req.body, tenantId: req.user!.tenantId }); res.status(201).json({ success: true, data: s }); } catch (e) { next(e); } });
  r.post('/:id/respond', async (req: AuthRequest, res, next) => { try { await Survey.findOneAndUpdate({ _id: req.params.id, tenantId: req.user!.tenantId }, { $push: { responses: { ...req.body, respondedAt: new Date() } } }); res.json({ success: true }); } catch (e) { next(e); } });
  return r;
})();

// --- Receipt Routes ---
export const receiptRoutes = (() => {
  const r = Router();
  r.use(authenticate);
  r.get('/', async (req: AuthRequest, res, next) => {
    try {
      const receipts = await Receipt.find({ tenantId: req.user!.tenantId })
        .populate({
          path: 'paymentId',
          populate: [
            { path: 'paidForId', select: 'name phone' },
            { path: 'paidById', select: 'name phone' }
          ]
        })
        .sort({ createdAt: -1 })
        .lean();
      res.json({ success: true, data: receipts });
    } catch (e) { next(e); }
  });
  r.get('/:id', async (req: AuthRequest, res, next) => {
    try {
      const receipt = await Receipt.findOne({ _id: req.params.id, tenantId: req.user!.tenantId })
        .populate({
          path: 'paymentId',
          populate: [
            { path: 'paidForId', select: 'name phone' },
            { path: 'paidById', select: 'name phone' }
          ]
        })
        .lean();
      res.json({ success: true, data: receipt });
    } catch (e) { next(e); }
  });

  r.post('/manual', async (req: AuthRequest, res, next) => {
    try {
      const { amount, type, paidById, paidForId, description, gateway = 'cash' } = req.body;
      const tenantId = req.user!.tenantId;
      
      const { Payment } = await import('../models/Payment');
      const { processPaymentDues } = await import('./payment.routes');
      
      const count = await Payment.countDocuments({ tenantId });
      const paymentNo = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
      
      const payment = await Payment.create({
        tenantId, paymentNo, type, amount,
        paidById,
        paidForId: paidForId || paidById,
        gateway: gateway.toLowerCase(),
        status: 'success', description,
      });

      const receiptCount = await Receipt.countDocuments({ tenantId });
      const receiptNo = `RCP-${new Date().getFullYear()}-${String(receiptCount + 1).padStart(6, '0')}`;
      const receipt = await Receipt.create({ tenantId, receiptNo, paymentId: payment._id });
      await Payment.findByIdAndUpdate(payment._id, { receiptId: receipt._id });

      // Process family balance and recurring dues
      await processPaymentDues(payment);

      res.status(201).json({ success: true, data: { payment, receipt } });
    } catch (e) { next(e); }
  });

  return r;
})();

// --- Audit Routes ---
export const auditRoutes = (() => {
  const r = Router();
  r.use(authenticate);
  r.get('/', async (req: AuthRequest, res, next) => { try { const { page = 1, limit = 50 } = req.query; const pageNum = parseInt(page as string), limitNum = parseInt(limit as string); const [logs, total] = await Promise.all([AuditLog.find({ tenantId: req.user!.tenantId }).populate('userId', 'name').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(), AuditLog.countDocuments({ tenantId: req.user!.tenantId })]); res.json({ success: true, data: logs, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } }); } catch (e) { next(e); } });
  return r;
})();

// --- Settings Routes ---
export const settingsRoutes = (() => {
  const r = Router();
  r.use(authenticate);
  r.get('/', async (req: AuthRequest, res, next) => { try { const s = await Settings.findOne({ tenantId: req.user!.tenantId }).lean(); res.json({ success: true, data: s }); } catch (e) { next(e); } });
  r.put('/', async (req: AuthRequest, res, next) => { try { const s = await Settings.findOneAndUpdate({ tenantId: req.user!.tenantId }, { ...req.body, tenantId: req.user!.tenantId }, { upsert: true, new: true }); res.json({ success: true, data: s }); } catch (e) { next(e); } });
  return r;
})();

// --- Report Routes ---
export const reportRoutes = (() => {
  const r = Router();
  r.use(authenticate);
  r.get('/financial', async (req: AuthRequest, res, next) => { try { const { Payment } = await import('../models/Payment'); const { startDate, endDate } = req.query; const filter: Record<string, unknown> = { tenantId: req.user!.tenantId }; if (startDate && endDate) filter.createdAt = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) }; const data = await Payment.aggregate([{ $match: filter }, { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }]); res.json({ success: true, data }); } catch (e) { next(e); } });
  return r;
})();

// --- Upload Routes ---
export const uploadRoutes = (() => {
  const r = Router();
  r.use(authenticate);
  r.post('/', async (req: AuthRequest, res, next) => { try { res.json({ success: true, message: 'Upload endpoint - use multipart/form-data with multer middleware' }); } catch (e) { next(e); } });
  return r;
})();

// --- WhatsApp Routes ---
export const whatsappRoutes = (() => {
  const r = Router();
  // WhatsApp webhook verification (no auth)
  r.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).json({ success: false });
    }
  });
  r.post('/webhook', (req, res) => {
    // Handle incoming WhatsApp messages
    const { entry } = req.body;
    if (entry) {
      // Process chatbot logic here
      console.log('WhatsApp message received:', JSON.stringify(entry, null, 2));
    }
    res.status(200).send('OK');
  });
  r.post('/send', authenticate, async (req: AuthRequest, res, next) => {
    try {
      // WhatsApp message sending logic
      res.json({ success: true, message: 'WhatsApp message queued' });
    } catch (e) { next(e); }
  });
  return r;
})();
