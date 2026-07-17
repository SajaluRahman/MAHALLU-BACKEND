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
        // Connect to databases
        await (0, database_1.connectDB)();
        await (0, redis_1.connectRedis)();
        // Create Express app
        const app = (0, app_1.createApp)();
        // Initialize cron jobs
        (0, jobs_1.initializeCronJobs)();
        const server = app.listen(PORT, () => {
            logger_1.logger.info(`🚀 Mahallu ERP Backend running on port ${PORT}`);
            logger_1.logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
            logger_1.logger.info(`🌐 API Base: http://localhost:${PORT}/api/v1`);
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
            logger_1.logger.error('Unhandled Promise Rejection:', err);
            server.close(() => process.exit(1));
        });
        process.on('uncaughtException', (err) => {
            logger_1.logger.error('Uncaught Exception:', err);
            process.exit(1);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=server.js.map