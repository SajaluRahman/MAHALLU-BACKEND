"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const logger_1 = require("./config/logger");
const jobs_1 = require("./jobs");
const PORT = parseInt(process.env.PORT || '5000', 10);
async function bootstrap() {
    try {
        console.log(`🚀 Bootstrapping Mahallu ERP Backend on port ${PORT}...`);
        // Connect MongoDB
        try {
            await (0, database_1.connectDB)();
        }
        catch (dbErr) {
            console.error('❌ MongoDB Connection Failure:', dbErr);
            logger_1.logger.error('MongoDB Connection Failure:', dbErr);
        }
        // Try Redis, but don't block server startup
        try {
            await (0, redis_1.connectRedis)();
        }
        catch (error) {
            console.warn('⚠️ Redis unavailable. Continuing without Redis caching.');
            logger_1.logger.warn('Redis unavailable. Continuing without Redis.');
        }
        const app = (0, app_1.createApp)();
        (0, jobs_1.initializeCronJobs)();
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Mahallu ERP Backend running on 0.0.0.0:${PORT}`);
            logger_1.logger.info(`🚀 Mahallu ERP Backend running on port ${PORT}`);
            logger_1.logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
            logger_1.logger.info(`🌐 API Base: http://0.0.0.0:${PORT}/api/v1`);
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger_1.logger.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger_1.logger.info('Server closed.');
                process.exit(0);
            });
        });
        process.on('unhandledRejection', (err) => {
            console.error('⚠️ Unhandled Promise Rejection:', err);
            logger_1.logger.error('Unhandled Promise Rejection:', err);
        });
        process.on('uncaughtException', (err) => {
            console.error('⚠️ Uncaught Exception:', err);
            logger_1.logger.error('Uncaught Exception:', err);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=server.js.map