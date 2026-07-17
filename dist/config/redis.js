"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
exports.getRedisClient = getRedisClient;
exports.setCache = setCache;
exports.getCache = getCache;
exports.deleteCache = deleteCache;
exports.addToBlacklist = addToBlacklist;
exports.isTokenBlacklisted = isTokenBlacklisted;
const redis_1 = require("redis");
const logger_1 = require("./logger");
let redisClient;
async function connectRedis() {
    try {
        redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 2) {
                        return false; // Stop reconnecting
                    }
                    return 500; // Retry after 500ms
                }
            }
        });
        redisClient.on('error', (err) => logger_1.logger.error('Redis error:', err));
        redisClient.on('connect', () => logger_1.logger.info('✅ Redis connected'));
        redisClient.on('reconnecting', () => logger_1.logger.warn('Redis reconnecting...'));
        await redisClient.connect();
    }
    catch (error) {
        logger_1.logger.warn('Redis not available, using in-memory fallback:', error);
        // Continue without Redis — rate limiting will use memory store
    }
}
function getRedisClient() {
    return redisClient || null;
}
async function setCache(key, value, ttlSeconds) {
    if (!redisClient?.isOpen)
        return;
    await redisClient.setEx(key, ttlSeconds, value);
}
async function getCache(key) {
    if (!redisClient?.isOpen)
        return null;
    return redisClient.get(key);
}
async function deleteCache(key) {
    if (!redisClient?.isOpen)
        return;
    await redisClient.del(key);
}
async function addToBlacklist(token, ttlSeconds) {
    await setCache(`blacklist:${token}`, '1', ttlSeconds);
}
async function isTokenBlacklisted(token) {
    const val = await getCache(`blacklist:${token}`);
    return val === '1';
}
//# sourceMappingURL=redis.js.map