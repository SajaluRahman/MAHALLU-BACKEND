"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = exports.authorizeRoles = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const shared_config_1 = require("@mahallu/shared-config");
const redis_1 = require("../config/redis");
const errorHandler_1 = require("./errorHandler");
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('Access token required', 401);
        }
        const token = authHeader.split(' ')[1];
        // Check if token is blacklisted
        const blacklisted = await (0, redis_1.isTokenBlacklisted)(token);
        if (blacklisted) {
            throw new errorHandler_1.AppError('Token has been revoked', 401);
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        // Fetch user to verify still active
        const user = await User_1.User.findById(decoded.userId).select('isActive tenantId role name permissions').lean();
        if (!user || !user.isActive) {
            throw new errorHandler_1.AppError('User not found or deactivated', 401);
        }
        req.user = {
            userId: decoded.userId,
            tenantId: decoded.tenantId,
            role: decoded.role,
            permissions: decoded.permissions,
            name: user.name,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorHandler_1.AppError('Invalid token', 401));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new errorHandler_1.AppError('Token expired', 401));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
// Permission-based authorization middleware factory
const authorize = (...permissions) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.AppError('Not authenticated', 401));
        }
        const userPermissions = shared_config_1.ROLE_PERMISSIONS[req.user.role] || [];
        const hasPermission = permissions.every(p => userPermissions.includes(p));
        if (!hasPermission) {
            return next(new errorHandler_1.AppError('Insufficient permissions', 403));
        }
        next();
    };
};
exports.authorize = authorize;
// Role-based authorization
const authorizeRoles = (...roles) => {
    return (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError('Access denied for your role', 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// Tenant isolation middleware — ensures tenantId from JWT matches request
const tenantMiddleware = (req, _res, next) => {
    if (!req.user) {
        return next(new errorHandler_1.AppError('Not authenticated', 401));
    }
    // Attach tenantId to query params for automatic filtering
    if (req.query) {
        req.tenantFilter = { tenantId: req.user.tenantId };
    }
    next();
};
exports.tenantMiddleware = tenantMiddleware;
//# sourceMappingURL=auth.js.map