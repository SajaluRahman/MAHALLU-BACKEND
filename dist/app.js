"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const logger_1 = require("./config/logger");
const rateLimiter_1 = require("./middleware/rateLimiter");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
// Route imports
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const member_routes_1 = __importDefault(require("./routes/member.routes"));
const family_routes_1 = __importDefault(require("./routes/family.routes"));
const mosque_routes_1 = __importDefault(require("./routes/mosque.routes"));
const madrasa_routes_1 = __importDefault(require("./routes/madrasa.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const teacher_routes_1 = __importDefault(require("./routes/teacher.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const homework_routes_1 = __importDefault(require("./routes/homework.routes"));
const exam_routes_1 = __importDefault(require("./routes/exam.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const donation_routes_1 = __importDefault(require("./routes/donation.routes"));
const property_routes_1 = __importDefault(require("./routes/property.routes"));
const zakat_routes_1 = __importDefault(require("./routes/zakat.routes"));
const nikah_routes_1 = __importDefault(require("./routes/nikah.routes"));
const death_routes_1 = __importDefault(require("./routes/death.routes"));
const cemetery_routes_1 = __importDefault(require("./routes/cemetery.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const certificate_routes_1 = __importDefault(require("./routes/certificate.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const survey_routes_1 = __importDefault(require("./routes/survey.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const whatsapp_routes_1 = __importDefault(require("./routes/whatsapp.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const mobile_routes_1 = __importDefault(require("./routes/mobile.routes"));
const registration_routes_1 = __importDefault(require("./routes/registration.routes"));
function createApp() {
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    // ---- Socket.io ----
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
        },
    });
    // Attach io to app for use in routes
    app.set('io', io);
    // Socket.io connection handler
    io.on('connection', (socket) => {
        logger_1.logger.info(`Socket connected: ${socket.id}`);
        socket.on('join-tenant', (tenantId) => {
            socket.join(`tenant-${tenantId}`);
        });
        socket.on('disconnect', () => {
            logger_1.logger.info(`Socket disconnected: ${socket.id}`);
        });
    });
    // ---- Security Middleware ----
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'res.cloudinary.com'],
            },
        },
    }));
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            const allowedOrigins = [
                process.env.FRONTEND_URL || 'http://localhost:3000',
                'http://localhost:3001',
                'https://mahallu.app',
                /\.mahallu\.app$/,
            ];
            if (!origin || allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    }));
    // ---- General Middleware ----
    app.use((0, compression_1.default)());
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use((0, express_mongo_sanitize_1.default)());
    // Custom middleware to clean empty string inputs to undefined to prevent Mongoose cast errors (e.g. for ObjectIds/Dates)
    app.use((req, _res, next) => {
        if (req.body && typeof req.body === 'object') {
            const clean = (obj) => {
                for (const key in obj) {
                    if (obj[key] === '') {
                        delete obj[key];
                    }
                    else if (obj[key] && typeof obj[key] === 'object') {
                        clean(obj[key]);
                    }
                }
            };
            clean(req.body);
        }
        next();
    });
    app.use((0, morgan_1.default)('combined', { stream: logger_1.stream }));
    app.use(requestLogger_1.requestLogger);
    // ---- Rate Limiting ----
    app.use('/api/', rateLimiter_1.globalRateLimiter);
    // ---- Health Check ----
    app.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Mahallu ERP API is running',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        });
    });
    // ---- API Routes ----
    const API_V1 = '/api/v1';
    app.use(`${API_V1}/auth`, auth_routes_1.default);
    app.use(`${API_V1}/dashboard`, dashboard_routes_1.default);
    app.use(`${API_V1}/members`, member_routes_1.default);
    app.use(`${API_V1}/families`, family_routes_1.default);
    app.use(`${API_V1}/mosque`, mosque_routes_1.default);
    app.use(`${API_V1}/madrasa`, madrasa_routes_1.default);
    app.use(`${API_V1}/students`, student_routes_1.default);
    app.use(`${API_V1}/teachers`, teacher_routes_1.default);
    app.use(`${API_V1}/attendance`, attendance_routes_1.default);
    app.use(`${API_V1}/homework`, homework_routes_1.default);
    app.use(`${API_V1}/exams`, exam_routes_1.default);
    app.use(`${API_V1}/payments`, payment_routes_1.default);
    app.use(`${API_V1}/donations`, donation_routes_1.default);
    app.use(`${API_V1}/properties`, property_routes_1.default);
    app.use(`${API_V1}/zakat`, zakat_routes_1.default);
    app.use(`${API_V1}/nikah`, nikah_routes_1.default);
    app.use(`${API_V1}/death`, death_routes_1.default);
    app.use(`${API_V1}/cemetery`, cemetery_routes_1.default);
    app.use(`${API_V1}/events`, event_routes_1.default);
    app.use(`${API_V1}/certificates`, certificate_routes_1.default);
    app.use(`${API_V1}/notifications`, notification_routes_1.default);
    app.use(`${API_V1}/surveys`, survey_routes_1.default);
    app.use(`${API_V1}/reports`, report_routes_1.default);
    app.use(`${API_V1}/upload`, upload_routes_1.default);
    app.use(`${API_V1}/whatsapp`, whatsapp_routes_1.default);
    app.use(`${API_V1}/audit-logs`, audit_routes_1.default);
    app.use(`${API_V1}/settings`, settings_routes_1.default);
    app.use(`${API_V1}/mobile`, mobile_routes_1.default);
    app.use(`${API_V1}/registrations`, registration_routes_1.default);
    // ---- 404 & Error Handlers ----
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return httpServer;
}
//# sourceMappingURL=app.js.map