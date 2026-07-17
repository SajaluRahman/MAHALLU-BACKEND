"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const Member_1 = require("../models/Member");
const Family_1 = require("../models/Family");
const Payment_1 = require("../models/Payment");
const Donation_1 = require("../models/Donation");
const Notification_1 = require("../models/Notification");
const Student_1 = require("../models/Student");
const Attendance_1 = require("../models/Attendance");
const Homework_1 = require("../models/Homework");
const Exam_1 = require("../models/Exam");
const Event_1 = require("../models/Event");
const Teacher_1 = require("../models/Teacher");
const Tenant_1 = require("../models/Tenant");
const axios_1 = __importDefault(require("axios"));
const shared_config_1 = require("@mahallu/shared-config");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// ──────────────────────────────────────────────────
// GET /mobile/me/profile
// Returns full user + member + family data
// ──────────────────────────────────────────────────
router.get('/me/profile', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).lean();
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        const member = user.memberId
            ? await Member_1.Member.findById(user.memberId).lean()
            : null;
        const family = member?.familyId
            ? await Family_1.Family.findById(member.familyId)
                .populate('headMemberId', 'name phone photo')
                .populate('members.memberId', 'name phone photo gender dateOfBirth occupation relationship status')
                .lean()
            : null;
        const tenant = await Tenant_1.Tenant.findById(req.user.tenantId)
            .select('name mahalluCode logo address phone email')
            .lean();
        res.json({ success: true, data: { user, member, family, tenant } });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/me/family
// Returns family with all members populated
// ──────────────────────────────────────────────────
router.get('/me/family', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId').lean();
        if (!user?.memberId)
            return res.json({ success: true, data: null });
        const member = await Member_1.Member.findById(user.memberId).select('familyId').lean();
        if (!member?.familyId)
            return res.json({ success: true, data: null });
        const family = await Family_1.Family.findById(member.familyId)
            .populate('headMemberId', 'name phone photo email gender dateOfBirth occupation qualification bloodGroup')
            .populate('members.memberId', 'name phone photo email gender dateOfBirth occupation qualification bloodGroup status memberId')
            .lean();
        res.json({ success: true, data: family });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/me/payments
// Payment history for the logged-in member
// ──────────────────────────────────────────────────
router.get('/me/payments', async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 50);
        const user = await User_1.User.findById(req.user.userId).select('memberId').lean();
        if (!user?.memberId)
            return res.json({ success: true, data: [], pagination: { page: 1, limit: limitNum, total: 0, totalPages: 0 } });
        const filter = { tenantId: req.user.tenantId, paidById: user.memberId };
        const [payments, total] = await Promise.all([
            Payment_1.Payment.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
            Payment_1.Payment.countDocuments(filter),
        ]);
        res.json({ success: true, data: payments, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/me/donations
// Donation history for the logged-in member
// ──────────────────────────────────────────────────
router.get('/me/donations', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId').lean();
        if (!user?.memberId)
            return res.json({ success: true, data: [] });
        const donations = await Donation_1.Donation.find({
            tenantId: req.user.tenantId,
            donorId: user.memberId,
        }).sort({ createdAt: -1 }).limit(50).lean();
        res.json({ success: true, data: donations });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/me/notifications
// Notifications for the logged-in user
// ──────────────────────────────────────────────────
router.get('/me/notifications', async (req, res, next) => {
    try {
        const notifications = await Notification_1.Notification.find({
            tenantId: req.user.tenantId,
            $or: [
                { recipientId: req.user.userId },
                { recipientId: { $exists: false } }, // Broadcast notifications
            ],
        }).sort({ createdAt: -1 }).limit(50).lean();
        res.json({ success: true, data: notifications });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/me/student
// Student record for logged-in student user
// ──────────────────────────────────────────────────
router.get('/me/student', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId').lean();
        if (!user?.memberId)
            return res.json({ success: true, data: null });
        const student = await Student_1.Student.findOne({
            tenantId: req.user.tenantId,
            memberId: user.memberId,
            isDeleted: { $ne: true },
        })
            .populate('memberId', 'name photo phone email gender dateOfBirth bloodGroup')
            .populate('classId', 'name')
            .populate('madrasaId', 'name')
            .populate('guardianId', 'name phone photo')
            .lean();
        res.json({ success: true, data: student });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/me/student/attendance
// Attendance records for the student
// ──────────────────────────────────────────────────
router.get('/me/student/attendance', async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const user = await User_1.User.findById(req.user.userId).select('memberId').lean();
        if (!user?.memberId)
            return res.json({ success: true, data: [] });
        const student = await Student_1.Student.findOne({ tenantId: req.user.tenantId, memberId: user.memberId }).select('_id').lean();
        if (!student)
            return res.json({ success: true, data: [] });
        const now = new Date();
        const m = month ? parseInt(month) : now.getMonth();
        const y = year ? parseInt(year) : now.getFullYear();
        const startDate = new Date(y, m, 1);
        const endDate = new Date(y, m + 1, 0, 23, 59, 59);
        const records = await Attendance_1.Attendance.find({
            tenantId: req.user.tenantId,
            entityType: 'student',
            entityId: student._id,
            date: { $gte: startDate, $lte: endDate },
        }).sort({ date: 1 }).lean();
        res.json({ success: true, data: records });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/me/student/homework
// Homework for the student's class
// ──────────────────────────────────────────────────
router.get('/me/student/homework', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId').lean();
        if (!user?.memberId)
            return res.json({ success: true, data: [] });
        const student = await Student_1.Student.findOne({ tenantId: req.user.tenantId, memberId: user.memberId }).select('classId _id').lean();
        if (!student)
            return res.json({ success: true, data: [] });
        const homework = await Homework_1.Homework.find({
            tenantId: req.user.tenantId,
            classId: student.classId,
        }).populate('teacherId', 'memberId').sort({ dueDate: -1 }).limit(30).lean();
        // Attach submission status for this student
        const enriched = homework.map((hw) => {
            const submission = hw.submissions?.find((s) => s.studentId?.toString() === student._id.toString());
            return { ...hw, mySubmission: submission || null };
        });
        res.json({ success: true, data: enriched });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/me/student/exams
// Exam results for the student
// ──────────────────────────────────────────────────
router.get('/me/student/exams', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId').lean();
        if (!user?.memberId)
            return res.json({ success: true, data: [] });
        const student = await Student_1.Student.findOne({ tenantId: req.user.tenantId, memberId: user.memberId }).select('classId _id').lean();
        if (!student)
            return res.json({ success: true, data: [] });
        const exams = await Exam_1.Exam.find({
            tenantId: req.user.tenantId,
            classId: student.classId,
            isPublished: true,
        }).sort({ date: -1 }).lean();
        // Filter results to only this student
        const enriched = exams.map((exam) => {
            const myResult = exam.results?.find((r) => r.studentId?.toString() === student._id.toString());
            return { ...exam, results: undefined, myResult: myResult || null };
        });
        res.json({ success: true, data: enriched });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/me/children
// For PARENT role: returns all students where guardianId matches
// ──────────────────────────────────────────────────
router.get('/me/children', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId').lean();
        if (!user?.memberId)
            return res.json({ success: true, data: [] });
        const children = await Student_1.Student.find({
            tenantId: req.user.tenantId,
            guardianId: user.memberId,
            isDeleted: { $ne: true },
        })
            .populate('memberId', 'name photo phone gender dateOfBirth')
            .populate('classId', 'name')
            .populate('madrasaId', 'name')
            .lean();
        // Enrich with attendance stats and recent homework
        const enriched = await Promise.all(children.map(async (child) => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const [attendanceRecords, pendingHomework] = await Promise.all([
                Attendance_1.Attendance.find({
                    tenantId: req.user.tenantId,
                    entityType: 'student',
                    entityId: child._id,
                    date: { $gte: thirtyDaysAgo },
                }).lean(),
                Homework_1.Homework.countDocuments({
                    tenantId: req.user.tenantId,
                    classId: child.classId,
                    dueDate: { $gte: new Date() },
                    'submissions.studentId': { $ne: child._id },
                }),
            ]);
            const presentCount = attendanceRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
            const totalCount = attendanceRecords.length;
            const attendancePercent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
            return { ...child, attendancePercent, pendingHomework };
        }));
        res.json({ success: true, data: enriched });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/events
// Upcoming events (public access for authenticated users)
// ──────────────────────────────────────────────────
router.get('/events', async (req, res, next) => {
    try {
        const { type } = req.query; // 'upcoming' or 'past'
        const now = new Date();
        const filter = { tenantId: req.user.tenantId };
        if (type === 'past') {
            filter.date = { $lt: now };
        }
        else {
            filter.date = { $gte: now };
        }
        const events = await Event_1.Event.find(filter).sort({ date: type === 'past' ? -1 : 1 }).limit(20).lean();
        res.json({ success: true, data: events });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/announcements
// Recent broadcast notifications
// ──────────────────────────────────────────────────
router.get('/announcements', async (req, res, next) => {
    try {
        const announcements = await Notification_1.Notification.find({
            tenantId: req.user.tenantId,
            recipientId: { $exists: false },
            status: { $in: ['sent', 'delivered'] },
        }).sort({ createdAt: -1 }).limit(10).lean();
        res.json({ success: true, data: announcements });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/prayer-times
// Proxy to Aladhan API with tenant location
// ──────────────────────────────────────────────────
router.get('/prayer-times', async (req, res, next) => {
    try {
        const tenant = await Tenant_1.Tenant.findById(req.user.tenantId).select('address settings').lean();
        const lat = req.query.lat || tenant?.address?.gps?.coordinates?.[1] || 11.2588; // Default: Malappuram
        const lng = req.query.lng || tenant?.address?.gps?.coordinates?.[0] || 75.7804;
        const method = req.query.method || 4; // Umm Al-Qura
        const { data } = await axios_1.default.get(`${shared_config_1.PRAYER_TIMES_API}/timings`, {
            params: {
                latitude: lat,
                longitude: lng,
                method,
                timestamp: Math.floor(Date.now() / 1000),
            },
        });
        res.json({ success: true, data: data.data?.timings || {} });
    }
    catch (e) {
        // Fallback to empty on API failure
        res.json({ success: true, data: {}, message: 'Prayer times unavailable' });
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/teachers
// Teacher directory
// ──────────────────────────────────────────────────
router.get('/teachers', async (req, res, next) => {
    try {
        const teachers = await Teacher_1.Teacher.find({
            tenantId: req.user.tenantId,
            status: 'active',
        })
            .populate('memberId', 'name photo phone email')
            .populate('madrasaId', 'name')
            .select('memberId madrasaId subjects qualification employeeId')
            .lean();
        res.json({ success: true, data: teachers });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=mobile.routes.js.map