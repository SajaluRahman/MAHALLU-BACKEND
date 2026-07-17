"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
require("../models");
async function connectDB() {
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URI_LOCAL || 'mongodb://localhost:27017/mahallu-erp';
    mongoose_1.default.set('strictQuery', false);
    // Auto-add tenantId to all queries via middleware
    mongoose_1.default.plugin((schema) => {
        schema.pre(['find', 'findOne', 'findOneAndUpdate', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'countDocuments'], function (next) {
            // Soft delete filter: exclude deleted documents by default
            if (this.getFilter && !this.getFilter().isDeleted && !this.getOptions?.()?.includeDeleted) {
                this.where({ isDeleted: { $ne: true } });
            }
            next();
        });
    });
    try {
        const conn = await mongoose_1.default.connect(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger_1.logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.logger.error('MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('MongoDB disconnected. Attempting to reconnect...');
        });
    }
    catch (error) {
        logger_1.logger.error('MongoDB connection failed:', error);
        throw error;
    }
}
async function disconnectDB() {
    await mongoose_1.default.disconnect();
    logger_1.logger.info('MongoDB disconnected.');
}
//# sourceMappingURL=database.js.map