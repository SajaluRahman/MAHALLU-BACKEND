"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const errorHandler_1 = require("../middleware/errorHandler");
const User_1 = require("../models/User");
const Tenant_1 = require("../models/Tenant");
class AuthController {
    static async login(req, res, next) {
        try {
            const { identifier, password, tenantCode } = req.body;
            if (!identifier || !password) {
                throw new errorHandler_1.AppError('Identifier and password are required', 400);
            }
            const { tokens, user } = await auth_service_1.AuthService.login(identifier, password, tenantCode);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: { tokens, user },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken)
                throw new errorHandler_1.AppError('Refresh token required', 400);
            const tokens = await auth_service_1.AuthService.refreshToken(refreshToken);
            res.status(200).json({ success: true, message: 'Token refreshed', data: { tokens } });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const accessToken = req.headers.authorization?.split(' ')[1] || '';
            if (req.user) {
                await auth_service_1.AuthService.logout(req.user.userId, refreshToken, accessToken);
            }
            res.status(200).json({ success: true, message: 'Logged out successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async me(req, res, next) {
        try {
            const user = await User_1.User.findById(req.user?.userId)
                .populate('memberId', 'name photo phone')
                .lean();
            if (!user)
                throw new errorHandler_1.AppError('User not found', 404);
            const tenant = await Tenant_1.Tenant.findById(req.user?.tenantId).select('name mahalluCode logo').lean();
            res.status(200).json({
                success: true,
                message: 'User profile',
                data: { user, tenant },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async setup2FA(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.setup2FA(req.user.userId);
            res.status(200).json({ success: true, message: '2FA setup initiated', data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async verify2FA(req, res, next) {
        try {
            const { token } = req.body;
            await auth_service_1.AuthService.verify2FA(req.user.userId, token);
            res.status(200).json({ success: true, message: '2FA enabled successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            await auth_service_1.AuthService.changePassword(req.user.userId, currentPassword, newPassword);
            res.status(200).json({ success: true, message: 'Password changed successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateFCMToken(req, res, next) {
        try {
            const { fcmToken } = req.body;
            await auth_service_1.AuthService.updateFCMToken(req.user.userId, fcmToken);
            res.status(200).json({ success: true, message: 'FCM token updated' });
        }
        catch (error) {
            next(error);
        }
    }
    static async adminResetPassword(req, res, next) {
        try {
            const { memberId } = req.params;
            const { newPassword, loginId } = req.body;
            const tenantId = req.user?.tenantId;
            if (!newPassword && !loginId) {
                throw new errorHandler_1.AppError('Please provide a new password or a new login ID', 400);
            }
            if (newPassword && newPassword.length < 6) {
                throw new errorHandler_1.AppError('Password must be at least 6 characters long', 400);
            }
            const userToReset = await User_1.User.findOne({ tenantId, memberId });
            if (!userToReset) {
                throw new errorHandler_1.AppError('User account not found for this member', 404);
            }
            if (newPassword) {
                // The pre-save hook in User model automatically hashes the password
                userToReset.passwordHash = newPassword;
            }
            if (loginId) {
                if (loginId.includes('@')) {
                    userToReset.email = loginId.toLowerCase();
                }
                else {
                    userToReset.phone = loginId;
                }
            }
            await userToReset.save();
            res.status(200).json({ success: true, message: 'Security credentials updated successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map