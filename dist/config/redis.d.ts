import { RedisClientType } from 'redis';
export declare function connectRedis(): Promise<void>;
export declare function getRedisClient(): RedisClientType | null;
export declare function setCache(key: string, value: string, ttlSeconds: number): Promise<void>;
export declare function getCache(key: string): Promise<string | null>;
export declare function deleteCache(key: string): Promise<void>;
export declare function addToBlacklist(token: string, ttlSeconds: number): Promise<void>;
export declare function isTokenBlacklisted(token: string): Promise<boolean>;
//# sourceMappingURL=redis.d.ts.map