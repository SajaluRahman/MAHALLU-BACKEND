"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Member_1 = require("../models/Member");
const Family_1 = require("../models/Family");
const Student_1 = require("../models/Student");
const Teacher_1 = require("../models/Teacher");
const Payment_1 = require("../models/Payment");
const Donation_1 = require("../models/Donation");
const Attendance_1 = require("../models/Attendance");
const Transaction_1 = require("../models/Transaction");
const shared_types_1 = require("@mahallu/shared-types");
const dayjs_1 = __importDefault(require("dayjs"));
class DashboardController {
    static async getKPIs(req, res, next) {
        try {
            const tenantId = new mongoose_1.default.Types.ObjectId(req.user.tenantId);
            const currentMonth = (0, dayjs_1.default)().startOf('month').toDate();
            const lastMonth = (0, dayjs_1.default)().subtract(1, 'month').startOf('month').toDate();
            const currentMonthEnd = (0, dayjs_1.default)().endOf('month').toDate();
            const [totalFamilies, totalMembers, activeStudents, activeTeachers, monthlyIncome, monthlyExpenses, pendingFees, monthlyDonations, zakatCollected, txIncome, txExpense,] = await Promise.all([
                Family_1.Family.countDocuments({ tenantId }),
                Member_1.Member.countDocuments({ tenantId, status: 'active' }),
                Student_1.Student.countDocuments({ tenantId, status: 'active' }),
                Teacher_1.Teacher.countDocuments({ tenantId, status: 'active' }),
                Payment_1.Payment.aggregate([
                    {
                        $match: {
                            tenantId,
                            status: shared_types_1.PaymentStatus.SUCCESS,
                            createdAt: { $gte: currentMonth, $lte: currentMonthEnd },
                            type: { $in: [shared_types_1.PaymentType.SUBSCRIPTION, shared_types_1.PaymentType.DONATION, shared_types_1.PaymentType.RENTAL, shared_types_1.PaymentType.ZAKAT] },
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                Payment_1.Payment.aggregate([
                    {
                        $match: {
                            tenantId,
                            status: shared_types_1.PaymentStatus.SUCCESS,
                            createdAt: { $gte: currentMonth, $lte: currentMonthEnd },
                            type: { $in: [shared_types_1.PaymentType.SALARY, shared_types_1.PaymentType.MAINTENANCE] },
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                Student_1.Student.aggregate([
                    { $match: { tenantId, status: 'active' } },
                    { $group: { _id: null, total: { $sum: '$feeBalance' } } },
                ]),
                Donation_1.Donation.aggregate([
                    { $match: { tenantId, createdAt: { $gte: currentMonth, $lte: currentMonthEnd } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                Payment_1.Payment.aggregate([
                    { $match: { tenantId, type: shared_types_1.PaymentType.ZAKAT, status: shared_types_1.PaymentStatus.SUCCESS } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                Transaction_1.Transaction.aggregate([
                    { $match: { tenantId, type: 'INCOME', date: { $gte: currentMonth, $lte: currentMonthEnd } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                Transaction_1.Transaction.aggregate([
                    { $match: { tenantId, type: 'EXPENSE', date: { $gte: currentMonth, $lte: currentMonthEnd } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
            ]);
            res.status(200).json({
                success: true,
                data: {
                    totalFamilies,
                    totalMembers,
                    activeStudents,
                    activeTeachers,
                    monthlyIncome: (monthlyIncome[0]?.total || 0) + (txIncome[0]?.total || 0),
                    monthlyExpenses: (monthlyExpenses[0]?.total || 0) + (txExpense[0]?.total || 0),
                    pendingFees: pendingFees[0]?.total || 0,
                    monthlyDonations: monthlyDonations[0]?.total || 0,
                    zakatCollected: zakatCollected[0]?.total || 0,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getIncomeExpenseChart(req, res, next) {
        try {
            const tenantId = new mongoose_1.default.Types.ObjectId(req.user.tenantId);
            const last6Months = (0, dayjs_1.default)().subtract(6, 'month').startOf('month').toDate();
            const [paymentData, txData] = await Promise.all([
                Payment_1.Payment.aggregate([
                    {
                        $match: {
                            tenantId,
                            status: shared_types_1.PaymentStatus.SUCCESS,
                            createdAt: { $gte: last6Months },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' },
                                isExpense: {
                                    $in: ['$type', [shared_types_1.PaymentType.SALARY, shared_types_1.PaymentType.MAINTENANCE]],
                                },
                            },
                            total: { $sum: '$amount' },
                        },
                    },
                ]),
                Transaction_1.Transaction.aggregate([
                    { $match: { tenantId, date: { $gte: last6Months } } },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$date' },
                                month: { $month: '$date' },
                                isExpense: { $eq: ['$type', 'EXPENSE'] },
                            },
                            total: { $sum: '$amount' },
                        },
                    },
                ])
            ]);
            // Combine
            const mergedMap = new Map();
            [...paymentData, ...txData].forEach(item => {
                const key = `${item._id.year}-${item._id.month}-${item._id.isExpense}`;
                if (mergedMap.has(key)) {
                    mergedMap.get(key).total += item.total;
                }
                else {
                    mergedMap.set(key, { ...item });
                }
            });
            const data = Array.from(mergedMap.values()).sort((a, b) => {
                if (a._id.year !== b._id.year)
                    return a._id.year - b._id.year;
                return a._id.month - b._id.month;
            });
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAttendanceChart(req, res, next) {
        try {
            const tenantId = new mongoose_1.default.Types.ObjectId(req.user.tenantId);
            const last30Days = (0, dayjs_1.default)().subtract(30, 'days').toDate();
            const data = await Attendance_1.Attendance.aggregate([
                { $match: { tenantId, entityType: 'student', date: { $gte: last30Days } } },
                {
                    $group: {
                        _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, status: '$status' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id.date': 1 } },
            ]);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMemberGrowthChart(req, res, next) {
        try {
            const tenantId = new mongoose_1.default.Types.ObjectId(req.user.tenantId);
            const last12Months = (0, dayjs_1.default)().subtract(12, 'month').startOf('month').toDate();
            const data = await Member_1.Member.aggregate([
                { $match: { tenantId, createdAt: { $gte: last12Months } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
            ]);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRecentActivity(req, res, next) {
        try {
            const tenantId = req.user.tenantId; // Mongoose find() casts string to ObjectId automatically
            const [recentMembers, recentPayments, recentDonations] = await Promise.all([
                Member_1.Member.find({ tenantId }).sort({ createdAt: -1 }).limit(5).select('name memberId photo createdAt').lean(),
                Payment_1.Payment.find({ tenantId, status: shared_types_1.PaymentStatus.SUCCESS })
                    .sort({ createdAt: -1 }).limit(5)
                    .populate('paidById', 'name').lean(),
                Donation_1.Donation.find({ tenantId }).sort({ createdAt: -1 }).limit(5)
                    .populate('donorId', 'name').lean(),
            ]);
            res.status(200).json({
                success: true,
                data: { recentMembers, recentPayments, recentDonations },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map