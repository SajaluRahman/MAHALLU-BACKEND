"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveRegistration = exports.rejectRegistration = exports.getPendingRegistrations = exports.getFamiliesForRegistration = exports.submitRegistration = void 0;
const RegistrationRequest_1 = require("../models/RegistrationRequest");
const Tenant_1 = require("../models/Tenant");
const User_1 = require("../models/User");
const Member_1 = require("../models/Member");
const Family_1 = require("../models/Family");
const Student_1 = require("../models/Student");
const Teacher_1 = require("../models/Teacher");
const shared_types_1 = require("@mahallu/shared-types");
const logger_1 = require("../config/logger");
// ---------------------------------------------------------
// PUBLIC ENDPOINTS (Called by Mobile App during registration)
// ---------------------------------------------------------
const submitRegistration = async (req, res) => {
    try {
        const { mahalluCode, type, payload } = req.body;
        if (!mahalluCode || !type || !payload) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const tenant = await Tenant_1.Tenant.findOne({ mahalluCode: mahalluCode.toUpperCase() });
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Invalid Mahallu Code' });
        }
        const registration = await RegistrationRequest_1.RegistrationRequest.create({
            tenantId: tenant._id,
            type,
            payload,
        });
        res.status(201).json({
            success: true,
            message: 'Registration request submitted successfully. Please wait for admin approval.',
            data: registration,
        });
    }
    catch (error) {
        logger_1.logger.error('Error submitting registration:', error);
        res.status(500).json({ success: false, message: 'Server error while submitting registration' });
    }
};
exports.submitRegistration = submitRegistration;
const getFamiliesForRegistration = async (req, res) => {
    try {
        const { mahalluCode } = req.params;
        if (!mahalluCode)
            return res.status(400).json({ success: false, message: 'Mahallu code is required' });
        const tenant = await Tenant_1.Tenant.findOne({ mahalluCode: mahalluCode.toUpperCase() });
        if (!tenant)
            return res.status(404).json({ success: false, message: 'Invalid Mahallu Code' });
        const families = await Family_1.Family.find({ tenantId: tenant._id, isDeleted: false })
            .populate('headMemberId', 'name')
            .lean();
        const formatted = families.map(f => ({
            _id: f._id,
            familyCode: f.familyCode,
            headName: f.headMemberId?.name || 'Unknown',
        }));
        res.status(200).json({ success: true, data: formatted });
    }
    catch (error) {
        logger_1.logger.error('Error fetching families for registration:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getFamiliesForRegistration = getFamiliesForRegistration;
// ---------------------------------------------------------
// PROTECTED ENDPOINTS (Called by Admin Dashboard)
// ---------------------------------------------------------
const getPendingRegistrations = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const registrations = await RegistrationRequest_1.RegistrationRequest.find({
            tenantId,
            status: RegistrationRequest_1.RegistrationStatus.PENDING,
        }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: 'Pending registrations fetched successfully',
            data: registrations,
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching registrations:', error);
        res.status(500).json({ success: false, message: 'Server error fetching registrations' });
    }
};
exports.getPendingRegistrations = getPendingRegistrations;
const rejectRegistration = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { id } = req.params;
        const request = await RegistrationRequest_1.RegistrationRequest.findOne({ _id: id, tenantId });
        if (!request) {
            return res.status(404).json({ success: false, message: 'Registration request not found' });
        }
        request.status = RegistrationRequest_1.RegistrationStatus.REJECTED;
        await request.save();
        res.status(200).json({ success: true, message: 'Registration request rejected' });
    }
    catch (error) {
        logger_1.logger.error('Error rejecting registration:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.rejectRegistration = rejectRegistration;
const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
};
const generateId = (prefix) => {
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const year = new Date().getFullYear();
    return `${prefix}-${year}-${randomStr}`;
};
const approveRegistration = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { id } = req.params;
        const request = await RegistrationRequest_1.RegistrationRequest.findOne({ _id: id, tenantId });
        if (!request || request.status !== RegistrationRequest_1.RegistrationStatus.PENDING) {
            return res.status(404).json({ success: false, message: 'Registration request not found or already processed' });
        }
        const { type, payload } = request;
        const generatedPassword = generatePassword();
        // We must generate a unique fallback email in case a family shares a phone number
        const uniqueSuffix = Math.random().toString(36).substring(2, 8);
        let email = payload.email || `${payload.phone}_${uniqueSuffix}@mahallu.local`;
        // 1. Create Base Member Profile for ALL types
        const member = await Member_1.Member.create({
            tenantId,
            memberId: generateId('MHL'),
            name: payload.name,
            phone: payload.phone,
            email: payload.email,
            gender: payload.gender || shared_types_1.Gender.MALE,
            dateOfBirth: payload.dob ? new Date(payload.dob) : undefined,
            status: shared_types_1.MemberStatus.ACTIVE,
            occupation: payload.occupation,
            qualification: payload.qualification,
        });
        let role = shared_types_1.UserRole.STUDENT;
        // 2. Handle Specific Role Logic
        if (type === RegistrationRequest_1.RegistrationType.MEMBER) {
            role = shared_types_1.UserRole.PARENT;
            const familyMembersData = [{ memberId: member._id, relationship: 'Head', isHead: true }];
            if (payload.familyMembers && Array.isArray(payload.familyMembers)) {
                for (const fm of payload.familyMembers) {
                    if (fm.name && fm.relationship) {
                        const dependent = await Member_1.Member.create({
                            tenantId,
                            memberId: generateId('MHL'),
                            name: fm.name,
                            phone: payload.phone, // Dependents use the head's phone number if not provided
                            gender: fm.gender || shared_types_1.Gender.MALE,
                            status: shared_types_1.MemberStatus.ACTIVE,
                        });
                        familyMembersData.push({ memberId: dependent._id, relationship: fm.relationship, isHead: false });
                    }
                }
            }
            const family = await Family_1.Family.create({
                tenantId,
                familyCode: generateId('FAM'),
                headMemberId: member._id,
                members: familyMembersData,
                address: {
                    line1: payload.addressLine1 || 'N/A',
                    city: payload.city || 'Unknown',
                    district: payload.district || 'Unknown',
                    state: payload.state || 'Unknown',
                    pincode: payload.pincode || '000000',
                    country: 'India',
                },
                outstandingBalance: 0,
            });
            await Member_1.Member.updateMany({ _id: { $in: familyMembersData.map(m => m.memberId) } }, { $set: { familyId: family._id } });
        }
        else if (type === RegistrationRequest_1.RegistrationType.STUDENT) {
            role = shared_types_1.UserRole.STUDENT;
            let guardianId = member._id;
            if (payload.familyId) {
                const family = await Family_1.Family.findById(payload.familyId);
                if (family) {
                    guardianId = family.headMemberId;
                    member.familyId = family._id;
                    family.members.push({
                        memberId: member._id,
                        relationship: 'Child/Dependent',
                        isHead: false
                    });
                    await family.save();
                }
            }
            // Dummy class & madrasa IDs if none passed. Ideally selected during registration.
            await Student_1.Student.create({
                tenantId,
                memberId: member._id,
                admissionNo: generateId('ADM'),
                admissionDate: new Date(),
                madrasaId: payload.madrasaId || member._id, // placeholder
                classId: payload.classId || member._id, // placeholder
                guardianId: guardianId, // Self or parent
                status: 'active',
                feePaid: 0,
                feeBalance: 0,
            });
        }
        else if (type === RegistrationRequest_1.RegistrationType.TEACHER) {
            role = shared_types_1.UserRole.USTADH;
            await Teacher_1.Teacher.create({
                tenantId,
                memberId: member._id,
                madrasaId: payload.madrasaId || member._id, // placeholder
                employeeId: generateId('EMP'),
                subjects: payload.subjects || [],
                qualification: payload.qualification || '',
                salary: 0,
                joiningDate: new Date(),
                status: 'active',
                documents: [],
            });
        }
        // 3. Create the User Account
        let userPhone = payload.phone;
        const existingUser = await User_1.User.findOne({ tenantId, phone: userPhone });
        if (existingUser) {
            userPhone = `${userPhone}_${uniqueSuffix}`;
        }
        const user = await User_1.User.create({
            tenantId,
            name: payload.name,
            email: email.toLowerCase(),
            phone: userPhone,
            role: role,
            passwordHash: generatedPassword,
            memberId: member._id,
            isActive: true,
        });
        member.userId = user._id;
        await member.save();
        // 4. Update request status
        request.status = RegistrationRequest_1.RegistrationStatus.APPROVED;
        await request.save();
        res.status(200).json({
            success: true,
            message: 'Registration approved successfully',
            data: {
                email: user.email,
                phone: user.phone,
                generatedPassword,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error approving registration:', error);
        res.status(500).json({ success: false, message: 'Server error while approving registration' });
    }
};
exports.approveRegistration = approveRegistration;
//# sourceMappingURL=registration.controller.js.map