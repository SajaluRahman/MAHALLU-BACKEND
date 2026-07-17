"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCronJobs = initializeCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../config/logger");
const Subscription_1 = require("../models/Subscription");
const Student_1 = require("../models/Student");
function initializeCronJobs() {
    // Daily at 9AM — check overdue subscriptions
    node_cron_1.default.schedule('0 9 * * *', async () => {
        logger_1.logger.info('Running: Overdue subscription check');
        try {
            const overdue = await Subscription_1.Subscription.updateMany({ status: 'active', dueDate: { $lt: new Date() } }, { $set: { status: 'overdue' } });
            logger_1.logger.info(`Marked ${overdue.modifiedCount} subscriptions as overdue`);
        }
        catch (error) {
            logger_1.logger.error('Cron error (subscription check):', error);
        }
    });
    // Monthly on 1st — generate subscription dues
    node_cron_1.default.schedule('0 8 1 * *', async () => {
        logger_1.logger.info('Running: Monthly subscription generation');
        // Generate next month subscription dues
    });
    // Daily at 8AM — fee reminder (students with balance > 0)
    node_cron_1.default.schedule('0 8 * * MON', async () => {
        logger_1.logger.info('Running: Weekly fee reminder check');
        try {
            const students = await Student_1.Student.find({ status: 'active', feeBalance: { $gt: 0 } })
                .populate('guardianId', 'phone')
                .lean();
            logger_1.logger.info(`Found ${students.length} students with outstanding fees`);
            // Trigger WhatsApp/SMS notifications here
        }
        catch (error) {
            logger_1.logger.error('Cron error (fee reminder):', error);
        }
    });
    logger_1.logger.info('✅ Cron jobs initialized');
}
//# sourceMappingURL=index.js.map