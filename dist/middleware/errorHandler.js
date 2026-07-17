"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../config/logger");
class AppError extends Error {
    constructor(message, statusCode = 500, errors) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // Log server errors
    if (statusCode >= 500) {
        logger_1.logger.error(`[${statusCode}] ${message}`, { stack: err.stack });
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: Object.values(err.errors || {}).map((e) => e.message),
        });
        return;
    }
    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        res.status(400).json({ success: false, message: 'Invalid ID format' });
        return;
    }
    // MongoDB duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        res.status(409).json({
            success: false,
            message: `${field} already exists`,
        });
        return;
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ success: false, message: 'Invalid token' });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({ success: false, message: 'Token expired' });
        return;
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(err.errors && { errors: err.errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, _res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map