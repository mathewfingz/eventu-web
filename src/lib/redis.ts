import Redis from 'ioredis';

declare global {
    var redis: Redis | undefined;
}

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Redis client singleton for caching, locks, and queue management
 */
export const redis = globalThis.redis || new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    // Reconnect strategy
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

if (process.env.NODE_ENV !== 'production') {
    globalThis.redis = redis;
}

// Helper functions for common operations
export async function getCache<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    try {
        return JSON.parse(data) as T;
    } catch {
        return data as unknown as T;
    }
}

export async function setCache(
    key: string,
    value: unknown,
    ttlSeconds?: number
): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
        await redis.set(key, serialized, 'EX', ttlSeconds);
    } else {
        await redis.set(key, serialized);
    }
}

export async function deleteCache(key: string): Promise<void> {
    await redis.del(key);
}

export async function invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
        await redis.del(...keys);
    }
}

// Alias for backward compatibility
export const getRedis = () => redis;

export default redis;
