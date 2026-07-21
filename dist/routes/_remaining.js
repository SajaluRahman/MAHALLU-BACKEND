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
exports.whatsappRoutes = exports.uploadRoutes = exports.reportRoutes = exports.settingsRoutes = exports.auditRoutes = exports.receiptRoutes = exports.surveyRoutes = exports.notificationRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Notification_1 = require("../models/Notification");
const AuditLog_1 = require("../models/AuditLog");
const Survey_1 = require("../models/Survey");
const Receipt_1 = require("../models/Receipt");
const Settings_1 = require("../models/Settings");
// --- Notification Routes ---
exports.notificationRoutes = (() => {
    const r = (0, express_1.Router)();
    r.use(auth_1.authenticate);
    r.get('/', async (req, res, next) => { try {
        const n = await Notification_1.Notification.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 }).limit(50).lean();
        res.json({ success: true, data: n });
    }
    catch (e) {
        next(e);
    } });
    r.post('/', async (req, res, next) => { try {
        const n = await Notification_1.Notification.create({ ...req.body, tenantId: req.user.tenantId });
        res.status(201).json({ success: true, data: n });
    }
    catch (e) {
        next(e);
    } });
    return r;
})();
// --- Survey Routes ---
exports.surveyRoutes = (() => {
    const r = (0, express_1.Router)();
    r.use(auth_1.authenticate);
    r.get('/', async (req, res, next) => { try {
        const s = await Survey_1.Survey.find({ tenantId: req.user.tenantId }).lean();
        res.json({ success: true, data: s });
    }
    catch (e) {
        next(e);
    } });
    r.post('/', async (req, res, next) => { try {
        const s = await Survey_1.Survey.create({ ...req.body, tenantId: req.user.tenantId });
        res.status(201).json({ success: true, data: s });
    }
    catch (e) {
        next(e);
    } });
    r.post('/:id/respond', async (req, res, next) => { try {
        await Survey_1.Survey.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $push: { responses: { ...req.body, respondedAt: new Date() } } });
        res.json({ success: true });
    }
    catch (e) {
        next(e);
    } });
    return r;
})();
// --- Receipt Routes ---
exports.receiptRoutes = (() => {
    const r = (0, express_1.Router)();
    r.use(auth_1.authenticate);
    r.get('/', async (req, res, next) => {
        try {
            const receipts = await Receipt_1.Receipt.find({ tenantId: req.user.tenantId })
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
        }
        catch (e) {
            next(e);
        }
    });
    r.get('/:id', async (req, res, next) => {
        try {
            const receipt = await Receipt_1.Receipt.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
                .populate({
                path: 'paymentId',
                populate: [
                    { path: 'paidForId', select: 'name phone' },
                    { path: 'paidById', select: 'name phone' }
                ]
            })
                .lean();
            res.json({ success: true, data: receipt });
        }
        catch (e) {
            next(e);
        }
    });
    r.post('/manual', async (req, res, next) => {
        try {
            const { amount, type, paidById, paidForId, description, gateway = 'cash' } = req.body;
            const tenantId = req.user.tenantId;
            const { Payment } = await Promise.resolve().then(() => __importStar(require('../models/Payment')));
            const { processPaymentDues } = await Promise.resolve().then(() => __importStar(require('./payment.routes')));
            const count = await Payment.countDocuments({ tenantId });
            const paymentNo = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
            const payment = await Payment.create({
                tenantId, paymentNo, type, amount,
                paidById,
                paidForId: paidForId || paidById,
                gateway: gateway.toLowerCase(),
                status: 'success', description,
            });
            const receiptCount = await Receipt_1.Receipt.countDocuments({ tenantId });
            const receiptNo = `RCP-${new Date().getFullYear()}-${String(receiptCount + 1).padStart(6, '0')}`;
            const receipt = await Receipt_1.Receipt.create({ tenantId, receiptNo, paymentId: payment._id });
            await Payment.findByIdAndUpdate(payment._id, { receiptId: receipt._id });
            // Process family balance and recurring dues
            await processPaymentDues(payment);
            res.status(201).json({ success: true, data: { payment, receipt } });
        }
        catch (e) {
            next(e);
        }
    });
    return r;
})();
// --- Audit Routes ---
exports.auditRoutes = (() => {
    const r = (0, express_1.Router)();
    r.use(auth_1.authenticate);
    r.get('/', async (req, res, next) => { try {
        const { page = 1, limit = 50 } = req.query;
        const pageNum = parseInt(page), limitNum = parseInt(limit);
        const [logs, total] = await Promise.all([AuditLog_1.AuditLog.find({ tenantId: req.user.tenantId }).populate('userId', 'name').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(), AuditLog_1.AuditLog.countDocuments({ tenantId: req.user.tenantId })]);
        res.json({ success: true, data: logs, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (e) {
        next(e);
    } });
    return r;
})();
// --- Settings Routes ---
exports.settingsRoutes = (() => {
    const r = (0, express_1.Router)();
    r.use(auth_1.authenticate);
    r.get('/', async (req, res, next) => { try {
        const s = await Settings_1.Settings.findOne({ tenantId: req.user.tenantId }).lean();
        res.json({ success: true, data: s });
    }
    catch (e) {
        next(e);
    } });
    r.put('/', async (req, res, next) => { try {
        const s = await Settings_1.Settings.findOneAndUpdate({ tenantId: req.user.tenantId }, { ...req.body, tenantId: req.user.tenantId }, { upsert: true, new: true });
        res.json({ success: true, data: s });
    }
    catch (e) {
        next(e);
    } });
    return r;
})();
// --- Report Routes ---
exports.reportRoutes = (() => {
    const r = (0, express_1.Router)();
    r.use(auth_1.authenticate);
    const escapeCSV = (val) => {
        if (val === null || val === undefined)
            return '';
        let str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            str = '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    };
    r.get('/financial', async (req, res, next) => { try {
        const { Payment } = await Promise.resolve().then(() => __importStar(require('../models/Payment')));
        const { startDate, endDate } = req.query;
        const filter = { tenantId: req.user.tenantId };
        if (startDate && endDate)
            filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        const data = await Payment.aggregate([{ $match: filter }, { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }]);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    } });
    r.get('/export/financial', async (req, res, next) => {
        try {
            const { Payment } = await Promise.resolve().then(() => __importStar(require('../models/Payment')));
            const payments = await Payment.find({ tenantId: req.user.tenantId })
                .populate({ path: 'paidForId', select: 'name', options: { strictPopulate: false } })
                .populate({ path: 'paidById', select: 'name', options: { strictPopulate: false } })
                .sort({ createdAt: -1 })
                .lean();
            const headers = ['Payment No', 'Date', 'Type', 'Amount', 'Gateway', 'Payment ID', 'Order ID', 'Status', 'Description', 'Paid For', 'Paid By'];
            const rows = payments.map((p) => [
                p.paymentNo || '',
                p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
                p.type || '',
                p.amount || 0,
                p.gateway || '',
                p.gatewayPaymentId || '',
                p.gatewayOrderId || '',
                p.status || '',
                p.description || '',
                p.paidForId?.name || '',
                p.paidById?.name || ''
            ]);
            const csvContent = [headers.join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=financial_report.csv');
            res.status(200).send(csvContent);
        }
        catch (e) {
            next(e);
        }
    });
    r.get('/export/members', async (req, res, next) => {
        try {
            const { Member } = await Promise.resolve().then(() => __importStar(require('../models/Member')));
            const members = await Member.find({ tenantId: req.user.tenantId })
                .populate({ path: 'familyId', select: 'familyCode address wardNo', options: { strictPopulate: false } })
                .sort({ name: 1 })
                .lean();
            const headers = ['Name', 'Member ID', 'Family Code', 'Ward No', 'Address', 'Phone', 'Email', 'Gender', 'DOB', 'Blood Group', 'Status'];
            const rows = members.map((m) => [
                m.name || '',
                m.memberId || '',
                m.familyId?.familyCode || '',
                m.familyId?.wardNo || '',
                m.familyId?.address?.line1 || '',
                m.phone || '',
                m.email || '',
                m.gender || '',
                m.dateOfBirth ? new Date(m.dateOfBirth).toLocaleDateString() : '',
                m.bloodGroup || '',
                m.status || ''
            ]);
            const csvContent = [headers.join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=member_census_report.csv');
            res.status(200).send(csvContent);
        }
        catch (e) {
            next(e);
        }
    });
    r.get('/export/academic', async (req, res, next) => {
        try {
            const { Student } = await Promise.resolve().then(() => __importStar(require('../models/Student')));
            const students = await Student.find({ tenantId: req.user.tenantId })
                .populate({ path: 'memberId', select: 'name phone gender dateOfBirth', options: { strictPopulate: false } })
                .populate({ path: 'classId', select: 'name', options: { strictPopulate: false } })
                .populate({ path: 'guardianId', select: 'name phone', options: { strictPopulate: false } })
                .sort({ name: 1 })
                .lean();
            const headers = ['Student Name', 'Admission No', 'Class', 'Gender', 'DOB', 'Parent Name', 'Parent Phone', 'Status'];
            const rows = students.map((s) => [
                s.memberId?.name || s.name || '',
                s.admissionNo || '',
                s.classId?.name || '',
                s.memberId?.gender || '',
                s.memberId?.dateOfBirth ? new Date(s.memberId.dateOfBirth).toLocaleDateString() : '',
                s.guardianId?.name || '',
                s.guardianId?.phone || '',
                s.status || ''
            ]);
            const csvContent = [headers.join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=academic_progress_report.csv');
            res.status(200).send(csvContent);
        }
        catch (e) {
            next(e);
        }
    });
    r.get('/export/income-expense', async (req, res, next) => {
        try {
            const { Transaction } = await Promise.resolve().then(() => __importStar(require('../models/Transaction')));
            const transactions = await Transaction.find({ tenantId: req.user.tenantId })
                .sort({ date: -1 })
                .lean();
            const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Reference No'];
            const rows = transactions.map((t) => [
                t.date ? new Date(t.date).toLocaleDateString() : '',
                t.type || '',
                t.category || '',
                t.amount || 0,
                t.description || '',
                t.referenceNo || ''
            ]);
            const csvContent = [headers.join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=income_expense_report.csv');
            res.status(200).send(csvContent);
        }
        catch (e) {
            next(e);
        }
    });
    r.get('/export/payments', async (req, res, next) => {
        try {
            const { Payment } = await Promise.resolve().then(() => __importStar(require('../models/Payment')));
            const payments = await Payment.find({ tenantId: req.user.tenantId })
                .populate({ path: 'paidForId', select: 'name', options: { strictPopulate: false } })
                .populate({ path: 'paidById', select: 'name', options: { strictPopulate: false } })
                .sort({ createdAt: -1 })
                .lean();
            const headers = ['Payment No', 'Date', 'Type', 'Amount', 'Gateway', 'Payment ID', 'Order ID', 'Status', 'Description', 'Paid For', 'Paid By'];
            const rows = payments.map((p) => [
                p.paymentNo || '',
                p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
                p.type || '',
                p.amount || 0,
                p.gateway || '',
                p.gatewayPaymentId || '',
                p.gatewayOrderId || '',
                p.status || '',
                p.description || '',
                p.paidForId?.name || '',
                p.paidById?.name || ''
            ]);
            const csvContent = [headers.join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=payments_history_report.csv');
            res.status(200).send(csvContent);
        }
        catch (e) {
            next(e);
        }
    });
    return r;
})();
// --- Upload Routes ---
exports.uploadRoutes = (() => {
    const r = (0, express_1.Router)();
    r.use(auth_1.authenticate);
    r.post('/', async (req, res, next) => { try {
        res.json({ success: true, message: 'Upload endpoint - use multipart/form-data with multer middleware' });
    }
    catch (e) {
        next(e);
    } });
    return r;
})();
// --- WhatsApp Routes ---
exports.whatsappRoutes = (() => {
    const r = (0, express_1.Router)();
    // WhatsApp webhook verification (no auth)
    r.get('/webhook', (req, res) => {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            res.status(200).send(challenge);
        }
        else {
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
    r.post('/send', auth_1.authenticate, async (req, res, next) => {
        try {
            // WhatsApp message sending logic
            res.json({ success: true, message: 'WhatsApp message queued' });
        }
        catch (e) {
            next(e);
        }
    });
    return r;
})();
//# sourceMappingURL=_remaining.js.map