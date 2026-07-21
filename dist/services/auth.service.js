"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const User_1 = require("../models/User");
const Tenant_1 = require("../models/Tenant");
const shared_config_1 = require("@mahallu/shared-config");
const shared_types_1 = require("@mahallu/shared-types");
const errorHandler_1 = require("../middleware/errorHandler");
const redis_1 = require("../config/redis");
const logger_1 = require("../config/logger");
class AuthService {
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        });
    }
    static generateRefreshToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
        });
    }
    static async login(identifier, password, tenantCode) {
        // Find tenant
        let tenantId;
        if (tenantCode) {
            const tenant = await Tenant_1.Tenant.findOne({ mahalluCode: tenantCode.toUpperCase(), isActive: true });
            if (!tenant)
                throw new errorHandler_1.AppError('Mahallu not found or inactive', 404);
            tenantId = tenant._id.toString();
        }
        // Find user by email or phone
        const isEmail = identifier.includes('@');
        const emailLower = identifier.toLowerCase();
        const query = {
            ...(tenantId && { tenantId }),
            ...(isEmail ? { email: emailLower } : { phone: identifier }),
            isDeleted: false,
        };
        let user = await User_1.User.findOne(query).select('+passwordHash +refreshTokens').lean();
        // Auto-provision demo accounts if missing on database
        if (!user && (emailLower === 'madrasa.admin@mahallu.app' || emailLower === 'sadar@mahallu.app' || emailLower === 'admin@mahallu.app')) {
            let tenantDoc = await Tenant_1.Tenant.findOne({ mahalluCode: tenantCode ? tenantCode.toUpperCase() : 'JMM001' });
            if (!tenantDoc) {
                tenantDoc = await Tenant_1.Tenant.create({
                    name: 'Jamia Masjid Mahallu',
                    mahalluCode: 'JMM001',
                    phone: '+919876543210',
                    email: 'admin@jamaiamasjid.in',
                    address: { line1: 'Main Road', city: 'Kozhikode', district: 'Kozhikode', state: 'Kerala', pincode: '673001', country: 'India' },
                });
            }
            let roleToAssign = shared_types_1.UserRole.SUPER_ADMIN;
            let nameToAssign = 'System Administrator';
            let defaultPass = 'Admin@123456';
            if (emailLower === 'madrasa.admin@mahallu.app') {
                roleToAssign = shared_types_1.UserRole.MADRASA_PRINCIPAL;
                nameToAssign = 'Madrasa Administrator';
                defaultPass = 'Madrasa@123456';
            }
            else if (emailLower === 'sadar@mahallu.app') {
                roleToAssign = shared_types_1.UserRole.SADAR_MUALIM;
                nameToAssign = 'Sadar Mualim';
                defaultPass = 'Sadar@123456';
            }
            await User_1.User.create({
                tenantId: tenantDoc._id,
                name: nameToAssign,
                email: emailLower,
                phone: emailLower === 'madrasa.admin@mahallu.app' ? '+919876543220' : (emailLower === 'sadar@mahallu.app' ? '+919876543221' : '+919876543210'),
                role: roleToAssign,
                passwordHash: defaultPass,
                isActive: true,
            });
            user = await User_1.User.findOne({ email: emailLower, tenantId: tenantDoc._id }).select('+passwordHash +refreshTokens').lean();
        }
        if (!user)
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        if (!user.isActive)
            throw new errorHandler_1.AppError('Account is deactivated', 401);
        // Compare password (using bcrypt via method)
        const userDoc = await User_1.User.findById(user._id).select('+passwordHash');
        if (!userDoc)
            throw new errorHandler_1.AppError('User not found', 401);
        const isPasswordValid = await userDoc.comparePassword(password);
        if (!isPasswordValid)
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        const permissions = shared_config_1.ROLE_PERMISSIONS[user.role] || [];
        const payload = {
            userId: user._id.toString(),
            tenantId: user.tenantId.toString(),
            role: user.role,
            permissions,
        };
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(user._id.toString());
        // Save refresh token
        await User_1.User.findByIdAndUpdate(user._id, {
            $push: { refreshTokens: refreshToken },
            lastLoginAt: new Date(),
        });
        const tokens = {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 min in seconds
        };
        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            tenantId: user.tenantId,
            avatar: user.avatar,
            twoFactorEnabled: user.twoFactorEnabled,
        };
        return { tokens, user: safeUser };
    }
    static async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await User_1.User.findById(decoded.userId).select('+refreshTokens').lean();
            if (!user || !user.refreshTokens?.includes(refreshToken)) {
                throw new errorHandler_1.AppError('Invalid refresh token', 401);
            }
            const blacklisted = await (0, redis_1.isTokenBlacklisted)(refreshToken);
            if (blacklisted)
                throw new errorHandler_1.AppError('Refresh token revoked', 401);
            const permissions = shared_config_1.ROLE_PERMISSIONS[user.role] || [];
            const payload = {
                userId: user._id.toString(),
                tenantId: user.tenantId.toString(),
                role: user.role,
                permissions,
            };
            const newAccessToken = this.generateAccessToken(payload);
            const newRefreshToken = this.generateRefreshToken(user._id.toString());
            // Rotate refresh token
            await User_1.User.findByIdAndUpdate(user._id, {
                $pull: { refreshTokens: refreshToken },
                $push: { refreshTokens: newRefreshToken },
            });
            // Blacklist old refresh token
            await (0, redis_1.addToBlacklist)(refreshToken, 30 * 24 * 60 * 60);
            return { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn: 900 };
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            throw new errorHandler_1.AppError('Invalid or expired refresh token', 401);
        }
    }
    static async logout(userId, refreshToken, accessToken) {
        await User_1.User.findByIdAndUpdate(userId, {
            $pull: { refreshTokens: refreshToken },
        });
        // Blacklist access token
        await (0, redis_1.addToBlacklist)(accessToken, 15 * 60);
        logger_1.logger.info(`User ${userId} logged out`);
    }
    static async setup2FA(userId) {
        const user = await User_1.User.findById(userId);
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        const secret = speakeasy_1.default.generateSecret({
            name: `${process.env.TOTP_APP_NAME || 'MahalluERP'}:${user.email || user.phone}`,
            length: 20,
        });
        const qrCode = await qrcode_1.default.toDataURL(secret.otpauth_url);
        await User_1.User.findByIdAndUpdate(userId, { twoFactorSecret: secret.base32 });
        return { secret: secret.base32, qrCode };
    }
    static async verify2FA(userId, token) {
        const user = await User_1.User.findById(userId).select('+twoFactorSecret');
        if (!user?.twoFactorSecret)
            throw new errorHandler_1.AppError('2FA not set up', 400);
        const verified = speakeasy_1.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2,
        });
        if (!verified)
            throw new errorHandler_1.AppError('Invalid 2FA code', 401);
        if (!user.twoFactorEnabled) {
            await User_1.User.findByIdAndUpdate(userId, { twoFactorEnabled: true });
        }
    }
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await User_1.User.findById(userId).select('+passwordHash');
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid)
            throw new errorHandler_1.AppError('Current password is incorrect', 400);
        user.passwordHash = newPassword; // Will be hashed by pre-save hook
        await user.save();
        // Invalidate all refresh tokens
        await User_1.User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });
    }
    static async updateFCMToken(userId, fcmToken) {
        await User_1.User.findByIdAndUpdate(userId, { fcmToken });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map