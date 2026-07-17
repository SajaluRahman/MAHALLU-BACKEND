import 'dotenv/config';
import { createApp } from './app';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './config/logger';
import { initializeCronJobs } from './jobs';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function bootstrap() {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();

    // Create Express app
    const app = createApp();

    // Initialize cron jobs
    initializeCronJobs();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Mahallu ERP Backend running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🌐 API Base: http://localhost:${PORT}/api/v1`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    });

    process.on('unhandledRejection', (err: Error) => {
      logger.error('Unhandled Promise Rejection:', err);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
