/**
 * Virtual Queue System
 * 
 * Queue-it style virtual waiting room for high-demand events.
 * Uses Redis sorted sets for fair, first-come-first-served ordering.
 */

import { getRedis } from '../redis';

const QUEUE_PREFIX = 'queue:';
const ADMITTED_PREFIX = 'admitted:';
const QUEUE_TTL = 3600; // 1 hour

export interface QueueEntry {
    userId: string;
    sessionId: string;
    position: number;
    joinedAt: number;
    estimatedWait: number; // seconds
    status: 'waiting' | 'admitted' | 'expired';
}

export interface QueueStatus {
    eventId: string;
    isActive: boolean;
    totalWaiting: number;
    admissionRate: number; // users per minute
    yourPosition?: number;
    estimatedWait?: number;
}

export interface AdmitResult {
    success: boolean;
    token?: string;
    expiresAt?: number;
    error?: string;
}

/**
 * Activate virtual queue for an event
 */
export async function activateQueue(
    eventId: string,
    admissionRate: number = 100 // users per minute
): Promise<boolean> {
    try {
        const redis = getRedis();
        const configKey = `${QUEUE_PREFIX}${eventId}:config`;

        await redis.hset(configKey, {
            active: '1',
            admissionRate: admissionRate.toString(),
            activatedAt: Date.now().toString(),
        });

        console.log(`[Queue] Activated for event ${eventId} at ${admissionRate}/min`);
        return true;
    } catch (error) {
        console.error('[Queue] Activation failed:', error);
        return false;
    }
}

/**
 * Deactivate virtual queue
 */
export async function deactivateQueue(eventId: string): Promise<boolean> {
    try {
        const redis = getRedis();
        const configKey = `${QUEUE_PREFIX}${eventId}:config`;

        await redis.hset(configKey, 'active', '0');

        console.log(`[Queue] Deactivated for event ${eventId}`);
        return true;
    } catch (error) {
        console.error('[Queue] Deactivation failed:', error);
        return false;
    }
}

/**
 * Check if queue is active for an event
 */
export async function isQueueActive(eventId: string): Promise<boolean> {
    try {
        const redis = getRedis();
        const configKey = `${QUEUE_PREFIX}${eventId}:config`;

        const active = await redis.hget(configKey, 'active');
        return active === '1';
    } catch (error) {
        return false;
    }
}

/**
 * Join the virtual queue
 */
export async function joinQueue(
    eventId: string,
    userId: string,
    sessionId: string
): Promise<QueueEntry | null> {
    try {
        const redis = getRedis();
        const queueKey = `${QUEUE_PREFIX}${eventId}:waiting`;
        const configKey = `${QUEUE_PREFIX}${eventId}:config`;

        // Check if already in queue
        const existingScore = await redis.zscore(queueKey, sessionId);
        if (existingScore !== null) {
            return await getQueuePosition(eventId, sessionId);
        }

        const now = Date.now();

        // Add to sorted set with timestamp as score
        await redis.zadd(queueKey, now, sessionId);

        // Store user data
        const userKey = `${QUEUE_PREFIX}${eventId}:user:${sessionId}`;
        await redis.hset(userKey, {
            userId,
            sessionId,
            joinedAt: now.toString(),
        });
        await redis.expire(userKey, QUEUE_TTL);

        // Get position
        const position = await redis.zrank(queueKey, sessionId);

        // Get admission rate for wait estimation
        const admissionRate = parseInt(await redis.hget(configKey, 'admissionRate') || '100', 10);
        const estimatedWait = Math.ceil(((position || 0) / admissionRate) * 60); // seconds

        console.log(`[Queue] ${sessionId} joined at position ${(position || 0) + 1}`);

        return {
            userId,
            sessionId,
            position: (position || 0) + 1,
            joinedAt: now,
            estimatedWait,
            status: 'waiting',
        };
    } catch (error) {
        console.error('[Queue] Join failed:', error);
        return null;
    }
}

/**
 * Get current queue position
 */
export async function getQueuePosition(
    eventId: string,
    sessionId: string
): Promise<QueueEntry | null> {
    try {
        const redis = getRedis();
        const queueKey = `${QUEUE_PREFIX}${eventId}:waiting`;
        const configKey = `${QUEUE_PREFIX}${eventId}:config`;
        const admittedKey = `${ADMITTED_PREFIX}${eventId}:${sessionId}`;

        // Check if admitted
        const admittedToken = await redis.get(admittedKey);
        if (admittedToken) {
            const userKey = `${QUEUE_PREFIX}${eventId}:user:${sessionId}`;
            const userData = await redis.hgetall(userKey);

            return {
                userId: userData.userId || '',
                sessionId,
                position: 0,
                joinedAt: parseInt(userData.joinedAt || '0', 10),
                estimatedWait: 0,
                status: 'admitted',
            };
        }

        // Get position in queue
        const position = await redis.zrank(queueKey, sessionId);

        if (position === null) {
            return null;
        }

        const userKey = `${QUEUE_PREFIX}${eventId}:user:${sessionId}`;
        const userData = await redis.hgetall(userKey);

        const admissionRate = parseInt(await redis.hget(configKey, 'admissionRate') || '100', 10);
        const estimatedWait = Math.ceil((position / admissionRate) * 60);

        return {
            userId: userData.userId || '',
            sessionId,
            position: position + 1,
            joinedAt: parseInt(userData.joinedAt || '0', 10),
            estimatedWait,
            status: 'waiting',
        };
    } catch (error) {
        console.error('[Queue] Get position failed:', error);
        return null;
    }
}

/**
 * Admit users from the queue (call this periodically)
 */
export async function admitNextBatch(
    eventId: string,
    count: number = 10
): Promise<string[]> {
    try {
        const redis = getRedis();
        const queueKey = `${QUEUE_PREFIX}${eventId}:waiting`;

        // Get next batch of users
        const sessionIds = await redis.zrange(queueKey, 0, count - 1);

        if (sessionIds.length === 0) {
            return [];
        }

        const admitted: string[] = [];

        for (const sessionId of sessionIds) {
            // Generate admission token
            const token = crypto.randomUUID();
            const admittedKey = `${ADMITTED_PREFIX}${eventId}:${sessionId}`;

            // Store admission token (valid for 15 minutes)
            await redis.set(admittedKey, token, 'EX', 900);

            // Remove from queue
            await redis.zrem(queueKey, sessionId);

            admitted.push(sessionId);
        }

        console.log(`[Queue] Admitted ${admitted.length} users for event ${eventId}`);

        return admitted;
    } catch (error) {
        console.error('[Queue] Admit failed:', error);
        return [];
    }
}

/**
 * Verify admission token
 */
export async function verifyAdmission(
    eventId: string,
    sessionId: string,
    token?: string
): Promise<boolean> {
    try {
        const redis = getRedis();
        const admittedKey = `${ADMITTED_PREFIX}${eventId}:${sessionId}`;

        const storedToken = await redis.get(admittedKey);

        // If token provided, verify it matches
        if (token && storedToken !== token) {
            return false;
        }

        return storedToken !== null;
    } catch (error) {
        console.error('[Queue] Verify failed:', error);
        return false;
    }
}

/**
 * Get queue status for an event
 */
export async function getQueueStatus(eventId: string): Promise<QueueStatus> {
    try {
        const redis = getRedis();
        const queueKey = `${QUEUE_PREFIX}${eventId}:waiting`;
        const configKey = `${QUEUE_PREFIX}${eventId}:config`;

        const [active, admissionRate, totalWaiting] = await Promise.all([
            redis.hget(configKey, 'active'),
            redis.hget(configKey, 'admissionRate'),
            redis.zcard(queueKey),
        ]);

        return {
            eventId,
            isActive: active === '1',
            totalWaiting,
            admissionRate: parseInt(admissionRate || '100', 10),
        };
    } catch (error) {
        console.error('[Queue] Get status failed:', error);
        return {
            eventId,
            isActive: false,
            totalWaiting: 0,
            admissionRate: 100,
        };
    }
}

/**
 * Leave the queue
 */
export async function leaveQueue(
    eventId: string,
    sessionId: string
): Promise<boolean> {
    try {
        const redis = getRedis();
        const queueKey = `${QUEUE_PREFIX}${eventId}:waiting`;
        const userKey = `${QUEUE_PREFIX}${eventId}:user:${sessionId}`;

        await redis.zrem(queueKey, sessionId);
        await redis.del(userKey);

        console.log(`[Queue] ${sessionId} left queue for event ${eventId}`);
        return true;
    } catch (error) {
        console.error('[Queue] Leave failed:', error);
        return false;
    }
}
