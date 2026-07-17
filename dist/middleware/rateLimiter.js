"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRateLimiter = exports.authRateLimiter = exports.globalRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("../config/logger");
exports.globalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        logger_1.logger.warn('Rate limit exceeded');
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.',
        });
    },
});
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10,
    skipSuccessfulRequests: true,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts, please wait 15 minutes.',
        });
    },
});
exports.uploadRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 min
    max: 20,
    handler: (_req, res) => {
        res.status(429).json({ success: false, message: 'Upload rate limit exceeded.' });
    },
});
//# sourceMappingURL=rateLimiter.js.map