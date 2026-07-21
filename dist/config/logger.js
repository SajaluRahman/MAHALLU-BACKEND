"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});
// Ensure logs directory exists if running in environments with file logging
const logsDir = path_1.default.join(process.cwd(), 'logs');
try {
    if (!fs_1.default.existsSync(logsDir)) {
        fs_1.default.mkdirSync(logsDir, { recursive: true });
    }
}
catch (e) {
    // Ignore in read-only filesystems
}
const transports = [
    new winston_1.default.transports.Console({
        format: combine(colorize(), logFormat),
    }),
];
// Add file transports if logs directory is writable
if (fs_1.default.existsSync(logsDir)) {
    try {
        transports.push(new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        }), new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'combined.log'),
            maxsize: 10 * 1024 * 1024,
            maxFiles: 10,
        }));
    }
    catch (e) {
        // Fallback to console logging
    }
}
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
    transports,
});
// Morgan stream for HTTP logging
exports.stream = {
    write: (message) => exports.logger.http(message.trim()),
};
//# sourceMappingURL=logger.js.map