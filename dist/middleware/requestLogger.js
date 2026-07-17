"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = exports.requestLogger = void 0;
const AuditLog_1 = require("../models/AuditLog");
const logger_1 = require("../config/logger");
const requestLogger = (req, _res, next) => {
    logger_1.logger.debug(`${req.method} ${req.path} - IP: ${req.ip}`);
    next();
};
exports.requestLogger = requestLogger;
// Audit log middleware factory — wraps mutating routes
const auditLog = (entity, action) => {
    return async (req, res, next) => {
        // Capture original json method to intercept response
        const originalJson = res.json.bind(res);
        res.json = function (body) {
            if (res.statusCode < 400 && req.user) {
                AuditLog_1.AuditLog.create({
                    tenantId: req.user.tenantId,
                    userId: req.user.userId,
                    action,
                    entity,
                    entityId: req.params.id || body?.data?._id,
                    ip: req.ip,
                    userAgent: req.get('user-agent'),
                    changes: action === 'UPDATE' ? { body: req.body } : undefined,
                }).catch(err => logger_1.logger.error('Audit log error:', err));
            }
            return originalJson(body);
        };
        next();
    };
};
exports.auditLog = auditLog;
//# sourceMappingURL=requestLogger.js.map