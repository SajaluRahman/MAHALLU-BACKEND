"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    // Daily at 12:05 AM — Family Recurring Donations Billing
    node_cron_1.default.schedule('5 0 * * *', async () => {
        logger_1.logger.info('Running: Family recurring donations evaluation');
        try {
            const now = new Date();
            const isFirstOfMonth = now.getDate() === 1;
            const isJanFirst = isFirstOfMonth && now.getMonth() === 0;
            if (isFirstOfMonth) {
                // Query families that need to be billed today
                const query = {
                    isDeleted: { $ne: true },
                    recurringDonationAmount: { $gt: 0 }
                };
                if (isJanFirst) {
                    // On Jan 1st, bill both monthly and yearly
                    query.recurringDonationType = { $in: ['monthly', 'yearly'] };
                }
                else {
                    // Otherwise, only bill monthly
                    query.recurringDonationType = 'monthly';
                }
                const { Family } = await Promise.resolve().then(() => __importStar(require('../models/Family')));
                const { User } = await Promise.resolve().then(() => __importStar(require('../models/User')));
                const { Notification } = await Promise.resolve().then(() => __importStar(require('../models/Notification')));
                const { Donation } = await Promise.resolve().then(() => __importStar(require('../models/Donation')));
                const { NotificationChannel } = await Promise.resolve().then(() => __importStar(require('@mahallu/shared-types')));
                const familiesToBill = await Family.find(query);
                logger_1.logger.info(`Found ${familiesToBill.length} families to bill for recurring donations.`);
                let billedCount = 0;
                const monthName = now.toLocaleString('default', { month: 'long' });
                const year = now.getFullYear();
                for (const family of familiesToBill) {
                    try {
                        const amount = family.recurringDonationAmount;
                        // Create a pending donation (due) record
                        await Donation.create({
                            tenantId: family.tenantId,
                            familyId: family._id,
                            amount: amount,
                            campaign: 'Recurring Donation',
                            purpose: `${family.recurringDonationType === 'monthly' ? monthName : ''} ${year} Due`.trim(),
                            status: 'pending',
                            dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 0) // Last day of month
                        });
                        // Increment balance
                        await Family.updateOne({ _id: family._id }, { $inc: { outstandingBalance: amount } });
                        // Send Notification
                        if (family.headMemberId) {
                            const headUser = await User.findOne({ memberId: family.headMemberId, tenantId: family.tenantId });
                            if (headUser) {
                                await Notification.create({
                                    tenantId: family.tenantId,
                                    channel: NotificationChannel.IN_APP,
                                    recipientId: headUser._id,
                                    title: 'Recurring Donation Due',
                                    body: `Your ${family.recurringDonationType} recurring donation of ${amount} has been added to your dues. Please clear your balance.`,
                                    status: 'pending',
                                });
                            }
                        }
                        billedCount++;
                    }
                    catch (err) {
                        logger_1.logger.error(`Failed to bill family ${family._id}`, err);
                    }
                }
                logger_1.logger.info(`Successfully billed ${billedCount} families for recurring donations.`);
            }
        }
        catch (error) {
            logger_1.logger.error('Cron error (recurring donations):', error);
        }
    });
    logger_1.logger.info('✅ Cron jobs initialized');
}
//# sourceMappingURL=index.js.map