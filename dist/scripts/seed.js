"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const database_1 = require("../config/database");
const Tenant_1 = require("../models/Tenant");
const User_1 = require("../models/User");
const Member_1 = require("../models/Member");
const Family_1 = require("../models/Family");
const Madrasa_1 = require("../models/Madrasa");
const Settings_1 = require("../models/Settings");
const Student_1 = require("../models/Student");
const logger_1 = require("../config/logger");
const shared_types_1 = require("@mahallu/shared-types");
const mongoose_1 = __importDefault(require("mongoose"));
async function seed() {
    await (0, database_1.connectDB)();
    logger_1.logger.info('🌱 Starting database seed...');
    // Clear existing data
    await Promise.all([
        Tenant_1.Tenant.deleteMany({}),
        User_1.User.deleteMany({}),
        Member_1.Member.deleteMany({}),
        Family_1.Family.deleteMany({}),
        Madrasa_1.Madrasa.deleteMany({}),
        Settings_1.Settings.deleteMany({}),
    ]);
    // 1. Create Tenant
    const tenant = await Tenant_1.Tenant.create({
        name: 'Jamia Masjid Mahallu',
        mahalluCode: 'JMM001',
        phone: '+919876543210',
        email: 'admin@jamaiamasjid.in',
        address: {
            line1: 'Main Road, Near Masjid',
            city: 'Kozhikode',
            district: 'Kozhikode',
            state: 'Kerala',
            pincode: '673001',
            country: 'India',
        },
        settings: { language: 'ml', currency: 'INR', timezone: 'Asia/Kolkata', dateFormat: 'DD/MM/YYYY', prayerTimeMethod: '1' },
    });
    logger_1.logger.info(`✅ Tenant created: ${tenant.name} (${tenant.mahalluCode})`);
    // 2. Create Super Admin User
    const superAdmin = await User_1.User.create({
        tenantId: tenant._id,
        name: 'System Administrator',
        email: process.env.SEED_ADMIN_EMAIL || 'admin@mahallu.app',
        phone: '+919876543210',
        role: shared_types_1.UserRole.SUPER_ADMIN,
        passwordHash: process.env.SEED_ADMIN_PASSWORD || 'Admin@123456',
        isActive: true,
    });
    logger_1.logger.info(`✅ Super Admin created: ${superAdmin.email}`);
    // 3. Create sample Members
    const members = await Member_1.Member.create([
        {
            tenantId: tenant._id, memberId: 'MHL-2024-0001',
            name: 'Mohammed Rashid', nameML: 'മൊഹമ്മദ് റാഷിദ്',
            gender: shared_types_1.Gender.MALE, phone: '+919876543211', status: shared_types_1.MemberStatus.ACTIVE,
            occupation: 'Teacher', bloodGroup: 'B+',
            dateOfBirth: new Date('1985-03-15'),
        },
        {
            tenantId: tenant._id, memberId: 'MHL-2024-0002',
            name: 'Fathima Rashid', nameML: 'ഫാത്തിമ റാഷിദ്',
            gender: shared_types_1.Gender.FEMALE, phone: '+919876543212', status: shared_types_1.MemberStatus.ACTIVE,
            occupation: 'Homemaker',
            dateOfBirth: new Date('1988-07-22'),
        },
        {
            tenantId: tenant._id, memberId: 'MHL-2024-0003',
            name: 'Ahmed Haris', nameML: 'അഹ്മദ് ഹാരിസ്',
            gender: shared_types_1.Gender.MALE, phone: '+919876543213', status: shared_types_1.MemberStatus.ACTIVE,
            occupation: 'Business',
            dateOfBirth: new Date('1980-01-10'),
        },
    ]);
    logger_1.logger.info(`✅ ${members.length} Members created`);
    // 4. Create sample Family
    const family = await Family_1.Family.create({
        tenantId: tenant._id,
        familyCode: 'FAM-0001',
        headMemberId: members[0]._id,
        members: [
            { memberId: members[0]._id, relationship: 'Head', isHead: true },
            { memberId: members[1]._id, relationship: 'Spouse', isHead: false },
        ],
        address: {
            line1: '12/A, Green Lane',
            city: 'Kozhikode',
            district: 'Kozhikode',
            state: 'Kerala',
            pincode: '673001',
            country: 'India',
            gps: { type: 'Point', coordinates: [75.7804, 11.2588] },
        },
        wardNo: 'Ward 5',
        outstandingBalance: 0,
    });
    // Update members with family
    await Member_1.Member.updateMany({ _id: { $in: [members[0]._id, members[1]._id] } }, { familyId: family._id });
    logger_1.logger.info(`✅ Family created: ${family.familyCode}`);
    // 5. Create Secretary User
    await User_1.User.create({
        tenantId: tenant._id,
        name: 'Ibrahim Secretary',
        email: 'secretary@mahallu.app',
        phone: '+919876543214',
        role: shared_types_1.UserRole.SECRETARY,
        passwordHash: 'Secretary@123',
        memberId: members[2]._id,
        isActive: true,
    });
    // 6. Create Treasurer User
    await User_1.User.create({
        tenantId: tenant._id,
        name: 'Kareem Treasurer',
        email: 'treasurer@mahallu.app',
        phone: '+919876543215',
        role: shared_types_1.UserRole.TREASURER,
        passwordHash: 'Treasurer@123',
        isActive: true,
    });
    // 7. Create Madrasa
    const madrasa = await Madrasa_1.Madrasa.create({
        tenantId: tenant._id,
        name: 'Darul Uloom Madrasa',
        address: {
            line1: 'Madrasa Complex',
            city: 'Kozhikode',
            district: 'Kozhikode',
            state: 'Kerala',
            pincode: '673001',
            country: 'India',
        },
        phone: '+919876543216',
        subjects: ['Quran', 'Tajweed', 'Arabic', 'Fiqh', 'Hadith', 'Aqeedah', 'Malayalam'],
        academicYear: '2024-2025',
    });
    logger_1.logger.info(`✅ Madrasa created: ${madrasa.name}`);
    // 8. Create Settings
    await Settings_1.Settings.create({
        tenantId: tenant._id,
        general: {
            mahalluName: tenant.name,
            phone: tenant.phone,
            email: tenant.email,
            address: `${tenant.address.city}, Kerala`,
        },
        notifications: { whatsappEnabled: false, smsEnabled: false, emailEnabled: true, pushEnabled: true },
        finance: { currency: 'INR', financialYearStart: 'April', autoReceiptEnabled: true },
        theme: { primaryColor: '#059669', mode: 'system', language: 'ml' },
    });
    // 9. Create Parent User
    const parentUser = await User_1.User.create({
        tenantId: tenant._id,
        name: 'Mohammed Rashid (Parent)',
        email: 'parent@mahallu.app',
        phone: '+919876543211',
        role: shared_types_1.UserRole.PARENT,
        passwordHash: 'Parent@123',
        memberId: members[0]._id, // Head of family FAM-0001
        isActive: true,
    });
    // 10. Create Student and Student User
    const student = await Student_1.Student.create({
        tenantId: tenant._id,
        memberId: members[2]._id, // Ahmed Haris
        admissionNo: 'ADM-2024-001',
        admissionDate: new Date(),
        classId: new mongoose_1.default.Types.ObjectId(), // Mock class ID
        madrasaId: madrasa._id,
        guardianId: members[0]._id, // Mohammed Rashid is guardian
        status: 'active',
    });
    const studentUser = await User_1.User.create({
        tenantId: tenant._id,
        name: 'Ahmed Haris (Student)',
        email: 'student@mahallu.app',
        phone: '+919876543213',
        role: shared_types_1.UserRole.STUDENT,
        passwordHash: 'Student@123',
        memberId: members[2]._id,
        isActive: true,
    });
    logger_1.logger.info('✅ Settings initialized');
    logger_1.logger.info('');
    logger_1.logger.info('🎉 Database seeded successfully!');
    logger_1.logger.info('');
    logger_1.logger.info('📋 Login Credentials:');
    logger_1.logger.info(`   Super Admin: ${process.env.SEED_ADMIN_EMAIL || 'admin@mahallu.app'} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin@123456'}`);
    logger_1.logger.info('   Secretary:   secretary@mahallu.app / Secretary@123');
    logger_1.logger.info('   Treasurer:   treasurer@mahallu.app / Treasurer@123');
    logger_1.logger.info('   Parent:      parent@mahallu.app / Parent@123');
    logger_1.logger.info('   Student:     student@mahallu.app / Student@123');
    logger_1.logger.info(`   Mahallu Code: JMM001`);
    await mongoose_1.default.disconnect();
    process.exit(0);
}
seed().catch((err) => {
    logger_1.logger.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map