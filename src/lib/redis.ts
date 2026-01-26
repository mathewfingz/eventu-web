import { Redis } from '@upstash/redis';

/**
 * Upstash Redis client for serverless environments
 * Uses REST API - works perfectly with Vercel Edge Functions
 */
const redisUrl = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
const redisToken = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();

export const redis = new Redis({
    url: redisUrl,
    token: redisToken,
});

// Helper functions for common operations
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const data = await redis.get<T>(key);
        return data;
    } catch (error) {
        console.error('[Redis] Get cache error:', error);
        return null;
    }
}

export async function setCache(
    key: string,
    value: unknown,
    ttlSeconds?: number
): Promise<void> {
    try {
        if (ttlSeconds) {
            await redis.set(key, value, { ex: ttlSeconds });
        } else {
            await redis.set(key, value);
        }
    } catch (error) {
        console.error('[Redis] Set cache error:', error);
    }
}

export async function deleteCache(key: string): Promise<void> {
    try {
        await redis.del(key);
    } catch (error) {
        console.error('[Redis] Delete cache error:', error);
    }
}

export async function invalidatePattern(pattern: string): Promise<void> {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.error('[Redis] Invalidate pattern error:', error);
    }
}

// Increment counter (useful for rate limiting, analytics)
export async function incrementCounter(key: string, ttlSeconds?: number): Promise<number> {
    try {
        const count = await redis.incr(key);
        if (ttlSeconds && count === 1) {
            await redis.expire(key, ttlSeconds);
        }
        return count;
    } catch (error) {
        console.error('[Redis] Increment error:', error);
        return 0;
    }
}

// Lock mechanism for inventory management
export async function acquireLock(key: string, ttlSeconds: number = 30): Promise<boolean> {
    try {
        const result = await redis.set(key, '1', { nx: true, ex: ttlSeconds });
        return result === 'OK';
    } catch (error) {
        console.error('[Redis] Acquire lock error:', error);
        return false;
    }
}

export async function releaseLock(key: string): Promise<void> {
    await deleteCache(key);
}

// Alias for backward compatibility
export const getRedis = () => redis;

export default redis;
