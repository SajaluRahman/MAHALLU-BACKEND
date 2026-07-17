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
const Certificate_1 = require("../models/Certificate");
const CertificateRequest_1 = require("../models/CertificateRequest");
const Property_1 = require("../models/Property");
const RentalRequest_1 = require("../models/RentalRequest");
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
// GET /mobile/me/dues
// Pending dues (donations with status 'pending') for family
// ──────────────────────────────────────────────────
router.get('/me/dues', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId').lean();
        if (!user?.memberId)
            return res.json({ success: true, data: [] });
        const member = await Member_1.Member.findById(user.memberId).select('familyId').lean();
        if (!member?.familyId)
            return res.json({ success: true, data: [] });
        const dues = await Donation_1.Donation.find({
            tenantId: req.user.tenantId,
            familyId: member.familyId,
            status: 'pending'
        }).sort({ createdAt: 1 }).lean();
        res.json({ success: true, data: dues });
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
            .populate('classId', 'name schedule')
            .populate('madrasaId', 'name')
            .populate('guardianId', 'name phone photo')
            .lean();
        if (student) {
            const { Teacher } = await Promise.resolve().then(() => __importStar(require('../models/Teacher')));
            const teacher = await Teacher.findOne({
                tenantId: req.user.tenantId,
                assignedStudents: student._id
            }).select('schedule').lean();
            if (teacher && teacher.schedule && (!student.classId || !student.classId.schedule)) {
                if (!student.classId)
                    student.classId = {};
                student.classId.schedule = teacher.schedule;
                student.classId.name = student.classId.name || 'Directly Assigned';
            }
        }
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
            .populate('classId', 'name schedule')
            .populate('madrasaId', 'name')
            .lean();
        // Enrich with attendance stats and recent homework
        const { Teacher } = await Promise.resolve().then(() => __importStar(require('../models/Teacher')));
        const enriched = await Promise.all(children.map(async (child) => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const [attendanceRecords, pendingHomework, teacher] = await Promise.all([
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
                Teacher.findOne({ tenantId: req.user.tenantId, assignedStudents: child._id }).select('schedule').lean()
            ]);
            if (teacher && teacher.schedule && (!child.classId || !child.classId.schedule)) {
                if (!child.classId)
                    child.classId = {};
                child.classId.schedule = teacher.schedule;
                child.classId.name = child.classId.name || 'Directly Assigned';
            }
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
        const tenant = await Tenant_1.Tenant.findById(req.user.tenantId).select('address').lean();
        const settings = await Promise.resolve().then(() => __importStar(require('../models/Settings'))).then(m => m.Settings.findOne({ tenantId: req.user.tenantId }).lean());
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
        res.json({
            success: true,
            data: {
                timings: data.data?.timings || {},
                iqamahTimes: settings?.iqamahTimes || {}
            }
        });
    }
    catch (e) {
        // Fallback to empty on API failure
        res.json({ success: true, data: { timings: {}, iqamahTimes: {} }, message: 'Prayer times unavailable' });
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
// ──────────────────────────────────────────────────
// GET /mobile/me/ustadh/classes
// Ustadh's assigned classes and students
// ──────────────────────────────────────────────────
router.get('/me/ustadh/classes', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId role').lean();
        if (!user?.memberId || user.role !== 'ustadh')
            return res.json({ success: true, data: [] });
        const teacher = await Teacher_1.Teacher.findOne({ tenantId: req.user.tenantId, memberId: user.memberId }).select('_id').lean();
        if (!teacher)
            return res.json({ success: true, data: [] });
        // Ensure we await import if Class model isn't imported at top
        const { Class } = await Promise.resolve().then(() => __importStar(require('../models/Class')));
        const classes = await Class.find({
            tenantId: req.user.tenantId,
            teacherId: teacher._id,
        })
            .populate({
            path: 'students',
            match: { isDeleted: { $ne: true } },
            populate: { path: 'memberId', select: 'name photo phone gender' }
        })
            .lean();
        if (teacher.assignedStudents && teacher.assignedStudents.length > 0) {
            const { Student } = await Promise.resolve().then(() => __importStar(require('../models/Student')));
            const directStudents = await Student.find({
                _id: { $in: teacher.assignedStudents },
                isDeleted: { $ne: true }
            })
                .populate('memberId', 'name photo phone gender')
                .lean();
            if (directStudents.length > 0) {
                classes.push({
                    _id: 'direct-assigned',
                    name: 'My Direct Students',
                    students: directStudents,
                    schedule: teacher.schedule || []
                });
            }
        }
        res.json({ success: true, data: classes });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// PUT /mobile/me/ustadh/classes/:id/timetable
// Update class timetable (schedule)
// ──────────────────────────────────────────────────
router.put('/me/ustadh/classes/:id/timetable', async (req, res, next) => {
    try {
        const { schedule } = req.body;
        if (!Array.isArray(schedule))
            return res.status(400).json({ error: 'Schedule must be an array' });
        const user = await User_1.User.findById(req.user.userId).select('memberId role').lean();
        if (!user?.memberId || user.role !== 'ustadh')
            return res.status(403).json({ error: 'Unauthorized' });
        const teacher = await Teacher_1.Teacher.findOne({ tenantId: req.user.tenantId, memberId: user.memberId }).select('_id').lean();
        if (!teacher)
            return res.status(403).json({ error: 'Unauthorized' });
        if (req.params.id === 'direct-assigned') {
            teacher.schedule = schedule;
            await Teacher_1.Teacher.updateOne({ _id: teacher._id }, { $set: { schedule } });
            return res.json({ success: true, data: { _id: 'direct-assigned', name: 'My Direct Students', schedule } });
        }
        const { Class } = await Promise.resolve().then(() => __importStar(require('../models/Class')));
        const classToUpdate = await Class.findOne({ _id: req.params.id, tenantId: req.user.tenantId, teacherId: teacher._id });
        if (!classToUpdate)
            return res.status(404).json({ error: 'Class not found' });
        classToUpdate.schedule = schedule;
        await classToUpdate.save();
        res.json({ success: true, data: classToUpdate });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// POST /mobile/me/ustadh/attendance
// Submit attendance for a class
// ──────────────────────────────────────────────────
router.post('/me/ustadh/attendance', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId role').lean();
        if (!user?.memberId || user.role !== 'ustadh')
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        const { classId, date, records } = req.body; // records: [{ studentId, status, note }]
        if (!classId || !date || !records || !Array.isArray(records)) {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);
        const ops = records.map((record) => ({
            updateOne: {
                filter: {
                    tenantId: req.user.tenantId,
                    entityType: 'student',
                    entityId: record.studentId,
                    classId: classId,
                    date: attendanceDate,
                },
                update: {
                    $set: {
                        status: record.status,
                        note: record.note,
                        markedById: user.memberId,
                    }
                },
                upsert: true,
            }
        }));
        if (ops.length > 0) {
            await Attendance_1.Attendance.bulkWrite(ops);
        }
        res.json({ success: true, message: 'Attendance marked successfully' });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// POST /mobile/me/ustadh/notify
// Send notification to class or specific student
// ──────────────────────────────────────────────────
router.post('/me/ustadh/notify', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId role').lean();
        if (!user?.memberId || user.role !== 'ustadh')
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        const { classId, studentId, title, message } = req.body;
        if (!classId || !title || !message) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }
        const { Class } = await Promise.resolve().then(() => __importStar(require('../models/Class')));
        const classData = await Class.findOne({ _id: classId, tenantId: req.user.tenantId }).lean();
        if (!classData)
            return res.status(404).json({ success: false, message: 'Class not found' });
        let targetStudentIds = studentId ? [studentId] : classData.students;
        const students = await Student_1.Student.find({ _id: { $in: targetStudentIds }, tenantId: req.user.tenantId }).select('guardianId').lean();
        const guardianIds = [...new Set(students.map(s => s.guardianId?.toString()).filter(Boolean))];
        // Find Users associated with those guardian members to send in-app notifications
        const usersToNotify = await User_1.User.find({ memberId: { $in: guardianIds }, tenantId: req.user.tenantId }).select('_id').lean();
        const notifications = usersToNotify.map(u => ({
            tenantId: req.user.tenantId,
            channel: 'in_app',
            recipientId: u._id,
            title: `[${classData.name}] ${title}`,
            body: message,
            status: 'pending',
        }));
        if (notifications.length > 0) {
            await Notification_1.Notification.insertMany(notifications);
        }
        res.json({ success: true, message: 'Notification sent successfully' });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/cemetery
// Fetch cemetery layout, plots, and available statuses
// ──────────────────────────────────────────────────
router.get('/cemetery', async (req, res, next) => {
    try {
        const { Cemetery } = await Promise.resolve().then(() => __importStar(require('../models/Cemetery')));
        let cemetery = await Cemetery.findOne({ tenantId: req.user.tenantId }).lean();
        if (!cemetery) {
            const newCemetery = await Cemetery.create({
                tenantId: req.user.tenantId,
                name: 'Main Cemetery',
                capacity: 60,
                plots: Array.from({ length: 60 }, (_, i) => ({
                    plotNo: `P-${i + 1}`,
                    section: 'A',
                    status: 'available',
                    isOccupied: false
                }))
            });
            cemetery = newCemetery.toObject();
        }
        // We should not leak deceasedId to all users unless public, but it's fine for now.
        res.json({ success: true, data: cemetery });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// POST /mobile/cemetery/request
// Request a plot
// ──────────────────────────────────────────────────
router.post('/cemetery/request', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId').lean();
        if (!user?.memberId)
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        const { plotNo, notes } = req.body;
        if (!plotNo)
            return res.status(400).json({ success: false, message: 'Plot number is required' });
        const { Cemetery } = await Promise.resolve().then(() => __importStar(require('../models/Cemetery')));
        let cemetery = await Cemetery.findOne({ tenantId: req.user.tenantId }).lean();
        if (!cemetery) {
            const newCemetery = await Cemetery.create({
                tenantId: req.user.tenantId,
                name: 'Main Cemetery',
                capacity: 60,
                plots: Array.from({ length: 60 }, (_, i) => ({
                    plotNo: `P-${i + 1}`,
                    section: 'A',
                    status: 'available',
                    isOccupied: false
                }))
            });
            cemetery = newCemetery.toObject();
        }
        const plot = cemetery.plots.find(p => p.plotNo === plotNo);
        if (!plot)
            return res.status(404).json({ success: false, message: 'Plot not found' });
        if (plot.isOccupied || plot.status === 'booked' || plot.status === 'occupied') {
            return res.status(400).json({ success: false, message: 'Plot is already booked or occupied' });
        }
        const { PlotRequest } = await Promise.resolve().then(() => __importStar(require('../models/PlotRequest')));
        // Check if a pending request already exists for this plot
        const existingReq = await PlotRequest.findOne({ tenantId: req.user.tenantId, plotNo, status: 'pending' });
        if (existingReq)
            return res.status(400).json({ success: false, message: 'This plot is currently under review for another member' });
        const request = await PlotRequest.create({
            tenantId: req.user.tenantId,
            cemeteryId: cemetery._id,
            plotNo,
            requestedBy: user.memberId,
            status: 'pending',
            notes,
        });
        res.json({ success: true, data: request, message: 'Plot request submitted successfully' });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/me/cemetery-requests
// Fetch the user's cemetery booking history and owned plots
// ──────────────────────────────────────────────────
router.get('/me/cemetery-requests', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId').lean();
        if (!user?.memberId)
            return res.json({ success: true, data: { requests: [], plots: [] } });
        const { PlotRequest } = await Promise.resolve().then(() => __importStar(require('../models/PlotRequest')));
        const { Cemetery } = await Promise.resolve().then(() => __importStar(require('../models/Cemetery')));
        const [requests, cemetery] = await Promise.all([
            PlotRequest.find({ tenantId: req.user.tenantId, requestedBy: user.memberId }).sort({ createdAt: -1 }).lean(),
            Cemetery.findOne({ tenantId: req.user.tenantId }).lean()
        ]);
        const ownedPlots = cemetery?.plots.filter(p => p.bookedById?.toString() === user.memberId?.toString()) || [];
        res.json({ success: true, data: { requests, plots: ownedPlots } });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/me/ustadh/homework
// Fetch homework assignments
// ──────────────────────────────────────────────────
router.get('/me/ustadh/homework', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId role').lean();
        if (!user?.memberId || user.role !== 'ustadh')
            return res.json({ success: true, data: [] });
        const { Teacher } = await Promise.resolve().then(() => __importStar(require('../models/Teacher')));
        const teacher = await Teacher.findOne({ tenantId: req.user.tenantId, memberId: user.memberId }).select('_id').lean();
        if (!teacher)
            return res.json({ success: true, data: [] });
        const { Homework } = await Promise.resolve().then(() => __importStar(require('../models/Homework')));
        const homework = await Homework.find({ tenantId: req.user.tenantId, teacherId: teacher._id })
            .populate('classId', 'name level')
            .populate('submissions.studentId', 'name admissionNo')
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: homework });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// POST /mobile/me/ustadh/homework
// Create a new homework assignment
// ──────────────────────────────────────────────────
router.post('/me/ustadh/homework', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId role').lean();
        if (!user?.memberId || user.role !== 'ustadh')
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        const { Teacher } = await Promise.resolve().then(() => __importStar(require('../models/Teacher')));
        const teacher = await Teacher.findOne({ tenantId: req.user.tenantId, memberId: user.memberId }).select('_id').lean();
        if (!teacher)
            return res.status(403).json({ success: false, message: 'Teacher profile not found' });
        const { classId, subject, title, description, dueDate } = req.body;
        if (!classId || !subject || !title || !dueDate) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const { Homework } = await Promise.resolve().then(() => __importStar(require('../models/Homework')));
        const newHomework = await Homework.create({
            tenantId: req.user.tenantId,
            classId,
            teacherId: teacher._id,
            subject,
            title,
            description,
            dueDate,
            attachments: [],
            submissions: []
        });
        res.json({ success: true, data: newHomework, message: 'Homework assigned successfully' });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// PUT /mobile/me/ustadh/homework/:id/grade
// Grade homework submissions
// ──────────────────────────────────────────────────
router.put('/me/ustadh/homework/:id/grade', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId role').lean();
        if (!user?.memberId || user.role !== 'ustadh')
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        const { Teacher } = await Promise.resolve().then(() => __importStar(require('../models/Teacher')));
        const teacher = await Teacher.findOne({ tenantId: req.user.tenantId, memberId: user.memberId }).select('_id').lean();
        if (!teacher)
            return res.status(403).json({ success: false, message: 'Teacher profile not found' });
        const { studentId, grade, feedback } = req.body;
        if (!studentId || grade === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const { Homework } = await Promise.resolve().then(() => __importStar(require('../models/Homework')));
        const homework = await Homework.findOne({ _id: req.params.id, tenantId: req.user.tenantId, teacherId: teacher._id });
        if (!homework)
            return res.status(404).json({ success: false, message: 'Homework not found' });
        const submissionIndex = homework.submissions.findIndex((s) => s.studentId?.toString() === studentId);
        if (submissionIndex >= 0) {
            homework.submissions[submissionIndex].grade = grade;
            homework.submissions[submissionIndex].feedback = feedback;
            homework.submissions[submissionIndex].gradedAt = new Date();
        }
        else {
            // If no submission exists, they can still enter a grade (e.g. offline submission)
            homework.submissions.push({
                studentId,
                submittedAt: new Date(),
                attachments: [],
                grade,
                feedback,
                gradedAt: new Date()
            });
        }
        await homework.save();
        res.json({ success: true, message: 'Grade saved successfully' });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/me/ustadh/exams
// Fetch exams for classes assigned to the Ustadh
// ──────────────────────────────────────────────────
router.get('/me/ustadh/exams', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId role').lean();
        if (!user?.memberId || user.role !== 'ustadh')
            return res.json({ success: true, data: [] });
        const { Teacher } = await Promise.resolve().then(() => __importStar(require('../models/Teacher')));
        const teacher = await Teacher.findOne({ tenantId: req.user.tenantId, memberId: user.memberId }).select('_id assignedStudents').lean();
        if (!teacher)
            return res.json({ success: true, data: [] });
        const { Class } = await Promise.resolve().then(() => __importStar(require('../models/Class')));
        const classes = await Class.find({ tenantId: req.user.tenantId, teacherId: teacher._id }).select('_id').lean();
        const classIds = classes.map(c => c._id);
        const { Exam } = await Promise.resolve().then(() => __importStar(require('../models/Exam')));
        const exams = await Exam.find({ tenantId: req.user.tenantId, classId: { $in: classIds } })
            .populate('classId', 'name level')
            .populate('results.studentId', 'name admissionNo')
            .sort({ date: -1 })
            .lean();
        res.json({ success: true, data: exams });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// POST /mobile/me/ustadh/exams
// Create an exam
// ──────────────────────────────────────────────────
router.post('/me/ustadh/exams', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId role').lean();
        if (!user?.memberId || user.role !== 'ustadh')
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        const { Teacher } = await Promise.resolve().then(() => __importStar(require('../models/Teacher')));
        const teacher = await Teacher.findOne({ tenantId: req.user.tenantId, memberId: user.memberId }).select('_id madrasaId').lean();
        if (!teacher)
            return res.status(403).json({ success: false, message: 'Teacher profile not found' });
        const { classId, title, subjects, date, totalMarks, passMark } = req.body;
        if (!classId || !title || !subjects || !date || !totalMarks || !passMark) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const { Exam } = await Promise.resolve().then(() => __importStar(require('../models/Exam')));
        const newExam = await Exam.create({
            tenantId: req.user.tenantId,
            madrasaId: teacher.madrasaId || req.user.tenantId,
            classId,
            title,
            subjects,
            date,
            totalMarks,
            passMark,
            results: [],
            isPublished: false
        });
        res.json({ success: true, data: newExam, message: 'Exam created successfully' });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// PUT /mobile/me/ustadh/exams/:id/results
// Enter exam results for a student
// ──────────────────────────────────────────────────
router.put('/me/ustadh/exams/:id/results', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).select('memberId role').lean();
        if (!user?.memberId || user.role !== 'ustadh')
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        const { studentId, marks, totalObtained, percentage, grade, isPassed, remarks } = req.body;
        if (!studentId || marks === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const { Exam } = await Promise.resolve().then(() => __importStar(require('../models/Exam')));
        const exam = await Exam.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        if (!exam)
            return res.status(404).json({ success: false, message: 'Exam not found' });
        const resultIndex = exam.results.findIndex((r) => r.studentId?.toString() === studentId);
        const newResult = {
            studentId,
            marks,
            totalObtained,
            percentage,
            grade,
            isPassed,
            remarks
        };
        if (resultIndex >= 0) {
            exam.results[resultIndex] = newResult;
        }
        else {
            exam.results.push(newResult);
        }
        await exam.save();
        res.json({ success: true, message: 'Exam results saved successfully' });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/certificates
// ──────────────────────────────────────────────────
router.get('/certificates', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).lean();
        if (!user || !user.memberId)
            return res.status(403).json({ success: false, message: 'Member profile required' });
        const requests = await CertificateRequest_1.CertificateRequest.find({ tenantId: req.user.tenantId, requestedBy: user.memberId }).sort({ createdAt: -1 }).populate('certificateId').lean();
        // Also fetch directly issued certificates that might not have a request
        const issuedCerts = await Certificate_1.Certificate.find({ tenantId: req.user.tenantId, recipientId: user.memberId }).sort({ issuedAt: -1 }).lean();
        res.json({ success: true, data: { requests, issuedCerts } });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// POST /mobile/certificates/request
// ──────────────────────────────────────────────────
router.post('/certificates/request', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).lean();
        if (!user || !user.memberId)
            return res.status(403).json({ success: false, message: 'Member profile required' });
        const { type, purpose } = req.body;
        if (!type || !purpose)
            return res.status(400).json({ success: false, message: 'Type and purpose are required' });
        const certReq = await CertificateRequest_1.CertificateRequest.create({
            tenantId: req.user.tenantId,
            requestedBy: user.memberId,
            type,
            purpose,
            status: 'PENDING'
        });
        res.status(201).json({ success: true, data: certReq });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// GET /mobile/properties
// ──────────────────────────────────────────────────
router.get('/properties', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).lean();
        if (!user || !user.memberId)
            return res.status(403).json({ success: false, message: 'Member profile required' });
        // Fetch all properties/equipment that can be rented
        const properties = await Property_1.Property.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 }).lean();
        // Fetch rental history for this member
        const rentalHistory = await RentalRequest_1.RentalRequest.find({ tenantId: req.user.tenantId, requestedBy: user.memberId }).populate('propertyId').sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: { properties, rentalHistory } });
    }
    catch (e) {
        next(e);
    }
});
// ──────────────────────────────────────────────────
// POST /mobile/properties/request
// ──────────────────────────────────────────────────
router.post('/properties/request', async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId).lean();
        if (!user || !user.memberId)
            return res.status(403).json({ success: false, message: 'Member profile required' });
        const { propertyId, quantityRequested, purpose, startDate, endDate } = req.body;
        if (!propertyId || !quantityRequested)
            return res.status(400).json({ success: false, message: 'Property and quantity are required' });
        const reqDoc = await RentalRequest_1.RentalRequest.create({
            tenantId: req.user.tenantId,
            requestedBy: user.memberId,
            propertyId,
            quantityRequested,
            purpose,
            startDate,
            endDate,
            status: 'PENDING'
        });
        res.status(201).json({ success: true, data: reqDoc });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=mobile.routes.js.map