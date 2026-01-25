/**
 * Real-time Analytics
 * 
 * Tracks active users and real-time metrics using Redis.
 * Provides data for live dashboards and iOS widgets.
 */

import { getRedis } from '../redis';

const ACTIVE_USERS_PREFIX = 'analytics:active:';
const REAL_TIME_STATS_PREFIX = 'analytics:realtime:';
const HEARTBEAT_TTL = 60; // 60 seconds
const ACTIVE_WINDOW = 300; // 5 minutes

export interface RealTimeStats {
    activeUsers: number;
    usersInCheckout: number;
    usersInQueue: number;
    ticketsSoldLastMinute: number;
    ticketsSoldLastHour: number;
    revenueLastMinute: number;
    revenueLastHour: number;
}

/**
 * Record user heartbeat (called every 30s from client)
 */
export async function recordHeartbeat(
    eventId: string,
    sessionId: string,
    location: 'browsing' | 'checkout' | 'queue' | 'payment'
): Promise<void> {
    try {
        const redis = getRedis();
        const now = Date.now();

        // Add to active users sorted set with timestamp
        const activeKey = `${ACTIVE_USERS_PREFIX}${eventId}:users`;
        await redis.zadd(activeKey, now, sessionId);

        // Track user location
        const locationKey = `${ACTIVE_USERS_PREFIX}${eventId}:${location}`;
        await redis.zadd(locationKey, now, sessionId);

        // Set expiry on keys
        await redis.expire(activeKey, ACTIVE_WINDOW + 60);
        await redis.expire(locationKey, ACTIVE_WINDOW + 60);

        // Remove stale entries (older than 5 minutes)
        const cutoff = now - (ACTIVE_WINDOW * 1000);
        await redis.zremrangebyscore(activeKey, '-inf', cutoff);
        await redis.zremrangebyscore(locationKey, '-inf', cutoff);
    } catch (error) {
        console.error('[RealTime] Heartbeat failed:', error);
    }
}

/**
 * Get real-time stats for an event
 */
export async function getRealTimeStats(eventId: string): Promise<RealTimeStats> {
    try {
        const redis = getRedis();
        const now = Date.now();
        const cutoff = now - (ACTIVE_WINDOW * 1000);

        // Count active users in different locations
        const [activeUsers, usersInCheckout, usersInQueue] = await Promise.all([
            redis.zcount(`${ACTIVE_USERS_PREFIX}${eventId}:users`, cutoff, '+inf'),
            redis.zcount(`${ACTIVE_USERS_PREFIX}${eventId}:checkout`, cutoff, '+inf'),
            redis.zcount(`${ACTIVE_USERS_PREFIX}${eventId}:queue`, cutoff, '+inf'),
        ]);

        // Get sales metrics from sorted sets
        const oneMinuteAgo = now - 60000;
        const oneHourAgo = now - 3600000;

        const [
            ticketsLastMinute,
            ticketsLastHour,
            revenueLastMinute,
            revenueLastHour,
        ] = await Promise.all([
            redis.zcount(`${REAL_TIME_STATS_PREFIX}${eventId}:tickets`, oneMinuteAgo, '+inf'),
            redis.zcount(`${REAL_TIME_STATS_PREFIX}${eventId}:tickets`, oneHourAgo, '+inf'),
            getSumInRange(redis, `${REAL_TIME_STATS_PREFIX}${eventId}:revenue`, oneMinuteAgo),
            getSumInRange(redis, `${REAL_TIME_STATS_PREFIX}${eventId}:revenue`, oneHourAgo),
        ]);

        return {
            activeUsers,
            usersInCheckout,
            usersInQueue,
            ticketsSoldLastMinute: ticketsLastMinute,
            ticketsSoldLastHour: ticketsLastHour,
            revenueLastMinute,
            revenueLastHour,
        };
    } catch (error) {
        console.error('[RealTime] Get stats failed:', error);
        return {
            activeUsers: 0,
            usersInCheckout: 0,
            usersInQueue: 0,
            ticketsSoldLastMinute: 0,
            ticketsSoldLastHour: 0,
            revenueLastMinute: 0,
            revenueLastHour: 0,
        };
    }
}

/**
 * Record a sale for real-time tracking
 */
export async function recordSale(
    eventId: string,
    ticketCount: number,
    revenue: number
): Promise<void> {
    try {
        const redis = getRedis();
        const now = Date.now();
        const saleId = `${now}_${Math.random().toString(36).slice(2)}`;

        // Record ticket count
        for (let i = 0; i < ticketCount; i++) {
            await redis.zadd(
                `${REAL_TIME_STATS_PREFIX}${eventId}:tickets`,
                now,
                `${saleId}_${i}`
            );
        }

        // Record revenue with amount as member for summing
        await redis.zadd(
            `${REAL_TIME_STATS_PREFIX}${eventId}:revenue`,
            now,
            `${revenue}:${saleId}`
        );

        // Clean up old entries (keep 1 hour)
        const oneHourAgo = now - 3600000;
        await redis.zremrangebyscore(`${REAL_TIME_STATS_PREFIX}${eventId}:tickets`, '-inf', oneHourAgo);
        await redis.zremrangebyscore(`${REAL_TIME_STATS_PREFIX}${eventId}:revenue`, '-inf', oneHourAgo);
    } catch (error) {
        console.error('[RealTime] Record sale failed:', error);
    }
}

/**
 * Helper to sum revenue values in a time range
 */
async function getSumInRange(redis: any, key: string, since: number): Promise<number> {
    try {
        const members = await redis.zrangebyscore(key, since, '+inf');
        return members.reduce((sum: number, member: string) => {
            const amount = parseFloat(member.split(':')[0]);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
    } catch (error) {
        return 0;
    }
}

/**
 * Get live user count for iOS widget
 */
export async function getLiveUserCount(eventId: string): Promise<number> {
    try {
        const redis = getRedis();
        const cutoff = Date.now() - (ACTIVE_WINDOW * 1000);
        return redis.zcount(`${ACTIVE_USERS_PREFIX}${eventId}:users`, cutoff, '+inf');
    } catch (error) {
        return 0;
    }
}

/**
 * Subscribe to real-time updates (for WebSocket broadcasting)
 */
export function subscribeToRealTimeUpdates(
    eventId: string,
    callback: (stats: RealTimeStats) => void
): { unsubscribe: () => void } {
    const intervalId = setInterval(async () => {
        const stats = await getRealTimeStats(eventId);
        callback(stats);
    }, 5000); // Update every 5 seconds

    return {
        unsubscribe: () => clearInterval(intervalId),
    };
}
