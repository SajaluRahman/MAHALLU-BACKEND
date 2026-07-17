"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const Payment_1 = require("../models/Payment");
const Member_1 = require("../models/Member");
const Attendance_1 = require("../models/Attendance");
const Tenant_1 = require("../models/Tenant");
const User_1 = require("../models/User");
const Student_1 = require("../models/Student");
const shared_types_1 = require("@mahallu/shared-types");
const dayjs_1 = __importDefault(require("dayjs"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI;
async function seed() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to DB');
        const tenant = await Tenant_1.Tenant.findOne();
        if (!tenant)
            throw new Error('No tenant found');
        const tenantId = tenant._id;
        const user = await User_1.User.findOne({ tenantId });
        if (!user)
            throw new Error('No user found');
        const adminId = user._id;
        // Get an existing member
        let member = await Member_1.Member.findOne({ tenantId });
        if (!member) {
            member = await Member_1.Member.create({
                tenantId,
                memberId: 'M-TEST-1',
                name: 'Test Member',
                gender: shared_types_1.Gender.MALE,
                phone: '1234567890',
                status: shared_types_1.MemberStatus.ACTIVE
            });
        }
        // --- Seed Payments (Income & Expenses for last 6 months) ---
        console.log('Seeding Payments...');
        const paymentsToInsert = [];
        for (let i = 0; i < 6; i++) {
            const monthDate = (0, dayjs_1.default)().subtract(i, 'month').startOf('month').add(15, 'days'); // Middle of the month
            // Income (Subscription)
            paymentsToInsert.push({
                tenantId,
                paymentNo: `PAY-INC-${Date.now()}-${i}`,
                type: shared_types_1.PaymentType.SUBSCRIPTION,
                amount: Math.floor(Math.random() * 20000) + 30000, // 30k to 50k
                paidById: member._id,
                gateway: shared_types_1.PaymentGateway.CASH,
                status: shared_types_1.PaymentStatus.SUCCESS,
                createdAt: monthDate.toDate()
            });
            // Expense (Salary)
            paymentsToInsert.push({
                tenantId,
                paymentNo: `PAY-EXP-${Date.now()}-${i}`,
                type: shared_types_1.PaymentType.SALARY,
                amount: Math.floor(Math.random() * 10000) + 20000, // 20k to 30k
                paidById: member._id,
                gateway: shared_types_1.PaymentGateway.CASH,
                status: shared_types_1.PaymentStatus.SUCCESS,
                createdAt: monthDate.toDate()
            });
        }
        await Payment_1.Payment.insertMany(paymentsToInsert);
        console.log(`Inserted ${paymentsToInsert.length} payments.`);
        // --- Seed Member Growth (Change createdAt of some existing members, or create new ones) ---
        console.log('Seeding Member Growth...');
        for (let i = 0; i < 6; i++) {
            const numMembers = Math.floor(Math.random() * 10) + 5; // 5 to 15 per month
            const monthDate = (0, dayjs_1.default)().subtract(i, 'month').startOf('month').add(10, 'days').toDate();
            for (let j = 0; j < numMembers; j++) {
                await Member_1.Member.create({
                    tenantId,
                    memberId: `M-SEED-${i}-${j}-${Date.now()}`,
                    name: `Seeded Member ${i}-${j}`,
                    gender: shared_types_1.Gender.MALE,
                    phone: `99999${i}${j}${Date.now().toString().slice(-3)}`,
                    status: shared_types_1.MemberStatus.ACTIVE,
                    createdAt: monthDate
                });
            }
        }
        console.log(`Inserted random members for past 6 months.`);
        // --- Seed Attendance for last 30 days ---
        console.log('Seeding Attendance...');
        let student = await Student_1.Student.findOne({ tenantId });
        if (!student) {
            // Just mock one
            student = (await Student_1.Student.create({
                tenantId,
                studentId: 'STU-TEST-1',
                memberId: member._id,
                admissionDate: new Date(),
                status: 'active',
                feeBalance: 0
            }));
        }
        const attendanceToInsert = [];
        for (let i = 0; i < 30; i++) {
            const d = (0, dayjs_1.default)().subtract(i, 'days').toDate();
            // Skip Sundays if you want, but random is fine
            if (d.getDay() === 0)
                continue;
            const isPresent = Math.random() > 0.15; // 85% attendance
            attendanceToInsert.push({
                tenantId,
                entityType: 'student',
                entityId: student._id,
                date: (0, dayjs_1.default)(d).startOf('day').toDate(),
                status: isPresent ? shared_types_1.AttendanceStatus.PRESENT : shared_types_1.AttendanceStatus.ABSENT,
                markedById: adminId
            });
        }
        // Clean old mocked attendance for this student to avoid unique index errors
        await Attendance_1.Attendance.deleteMany({ tenantId, entityId: student._id });
        await Attendance_1.Attendance.insertMany(attendanceToInsert);
        console.log(`Inserted ${attendanceToInsert.length} attendance records.`);
        console.log('Seeding complete!');
        process.exit(0);
    }
    catch (err) {
        console.error('Error seeding:', err);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed-analytics.js.map