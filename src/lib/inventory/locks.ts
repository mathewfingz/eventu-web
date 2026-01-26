/**
 * Inventory Lock System
 *
 * Redis-based distributed locking for ticket inventory management.
 * Prevents overselling through atomic operations with 10-minute timeouts.
 */

import { redis } from '../redis';

const LOCK_DURATION = 600; // 10 minutes in seconds
const LOCK_PREFIX = 'lock:';
const INVENTORY_PREFIX = 'inventory:';
const SESSION_LOCKS_PREFIX = 'session_locks:';

export interface TicketLock {
    lockId: string;
    ticketTypeId: string;
    quantity: number;
    sessionId: string;
    userId?: string;
    createdAt: number;
    expiresAt: number;
}

export interface LockResult {
    success: boolean;
    lock?: TicketLock;
    error?: {
        code: 'NO_INVENTORY' | 'LOCK_FAILED' | 'ALREADY_LOCKED' | 'REDIS_ERROR';
        message: string;
        available?: number;
    };
}

export interface ReleaseResult {
    success: boolean;
    releasedQuantity?: number;
    error?: string;
}

/**
 * Initialize inventory in Redis from database
 * Call this when event goes on sale or inventory changes
 */
export async function initializeInventory(
    ticketTypeId: string,
    availableQuantity: number
): Promise<boolean> {
    try {
        const key = `${INVENTORY_PREFIX}${ticketTypeId}`;

        await redis.set(key, availableQuantity.toString());

        console.log(`[Inventory] Initialized ${ticketTypeId} with ${availableQuantity} tickets`);
        return true;
    } catch (error) {
        console.error('[Inventory] Failed to initialize:', error);
        return false;
    }
}

/**
 * Get current available inventory
 */
export async function getAvailableInventory(ticketTypeId: string): Promise<number> {
    try {
        const key = `${INVENTORY_PREFIX}${ticketTypeId}`;

        const value = await redis.get(key);
        return value ? parseInt(value as string, 10) : 0;
    } catch (error) {
        console.error('[Inventory] Failed to get inventory:', error);
        return 0;
    }
}

/**
 * Lock tickets for a session
 *
 * Uses atomic operations for check-and-decrement
 */
export async function lockTickets(
    ticketTypeId: string,
    quantity: number,
    sessionId: string,
    userId?: string
): Promise<LockResult> {
    try {
        const inventoryKey = `${INVENTORY_PREFIX}${ticketTypeId}`;
        const lockId = `${LOCK_PREFIX}${ticketTypeId}:${sessionId}`;
        const sessionLocksKey = `${SESSION_LOCKS_PREFIX}${sessionId}`;

        // Check if session already has a lock for this ticket type
        const existingLock = await redis.get(lockId);
        if (existingLock) {
            return {
                success: true,
                lock: JSON.parse(existingLock as string),
            };
        }

        // Get current inventory
        const currentStr = await redis.get(inventoryKey);
        const current = currentStr ? parseInt(currentStr as string, 10) : 0;

        // Check availability
        if (current < quantity) {
            return {
                success: false,
                error: {
                    code: 'NO_INVENTORY',
                    message: 'No hay suficientes boletas disponibles',
                    available: current,
                },
            };
        }

        const now = Date.now();
        const expiresAt = now + (LOCK_DURATION * 1000);

        const lockData: TicketLock = {
            lockId,
            ticketTypeId,
            quantity,
            sessionId,
            userId,
            createdAt: now,
            expiresAt,
        };

        // Atomic decrement
        const newInventory = await redis.decrby(inventoryKey, quantity);

        // If we went negative, rollback
        if (newInventory < 0) {
            await redis.incrby(inventoryKey, quantity);
            return {
                success: false,
                error: {
                    code: 'NO_INVENTORY',
                    message: 'No hay suficientes boletas disponibles',
                    available: current,
                },
            };
        }

        // Create lock record with expiration
        await redis.set(lockId, JSON.stringify(lockData), { ex: LOCK_DURATION });

        // Track lock in session
        await redis.sadd(sessionLocksKey, lockId);
        await redis.expire(sessionLocksKey, LOCK_DURATION);

        console.log(`[Inventory] Locked ${quantity} tickets for session ${sessionId}`);

        return {
            success: true,
            lock: lockData,
        };
    } catch (error) {
        console.error('[Inventory] Lock failed:', error);
        return {
            success: false,
            error: {
                code: 'REDIS_ERROR',
                message: 'Error al reservar boletas',
            },
        };
    }
}

/**
 * Release locked tickets back to inventory
 */
export async function releaseTicketLock(lockId: string): Promise<ReleaseResult> {
    try {
        // Get lock data
        const lockDataStr = await redis.get(lockId);

        if (!lockDataStr) {
            return { success: true, releasedQuantity: 0 };
        }

        const lockData: TicketLock = JSON.parse(lockDataStr as string);
        const inventoryKey = `${INVENTORY_PREFIX}${lockData.ticketTypeId}`;
        const sessionLocksKey = `${SESSION_LOCKS_PREFIX}${lockData.sessionId}`;

        // Delete the lock
        await redis.del(lockId);

        // Remove from session locks
        await redis.srem(sessionLocksKey, lockId);

        // Return inventory
        await redis.incrby(inventoryKey, lockData.quantity);

        console.log(`[Inventory] Released ${lockData.quantity} tickets from lock ${lockId}`);

        return {
            success: true,
            releasedQuantity: lockData.quantity,
        };
    } catch (error) {
        console.error('[Inventory] Release failed:', error);
        return {
            success: false,
            error: 'Failed to release lock',
        };
    }
}

/**
 * Release all locks for a session
 */
export async function releaseSessionLocks(sessionId: string): Promise<ReleaseResult> {
    try {
        const sessionLocksKey = `${SESSION_LOCKS_PREFIX}${sessionId}`;

        // Get all locks for this session
        const lockIds = (await redis.smembers(sessionLocksKey)) as string[];

        let totalReleased = 0;

        for (const lockId of lockIds) {
            const result = await releaseTicketLock(lockId);
            if (result.releasedQuantity) {
                totalReleased += result.releasedQuantity;
            }
        }

        // Clean up session key
        await redis.del(sessionLocksKey);

        return {
            success: true,
            releasedQuantity: totalReleased,
        };
    } catch (error) {
        console.error('[Inventory] Session release failed:', error);
        return {
            success: false,
            error: 'Failed to release session locks',
        };
    }
}

/**
 * Confirm lock after successful payment
 * Removes the lock without returning inventory
 */
export async function confirmLock(lockId: string): Promise<boolean> {
    try {
        // Get lock data first
        const lockDataStr = await redis.get(lockId);

        if (!lockDataStr) {
            return false;
        }

        const lockData: TicketLock = JSON.parse(lockDataStr as string);
        const sessionLocksKey = `${SESSION_LOCKS_PREFIX}${lockData.sessionId}`;

        // Just delete the lock, don't return inventory
        await redis.del(lockId);
        await redis.srem(sessionLocksKey, lockId);

        console.log(`[Inventory] Confirmed lock ${lockId} - tickets sold`);

        return true;
    } catch (error) {
        console.error('[Inventory] Confirm failed:', error);
        return false;
    }
}

/**
 * Get lock status
 */
export async function getLockStatus(lockId: string): Promise<TicketLock | null> {
    try {
        const lockDataStr = await redis.get(lockId);

        if (!lockDataStr) {
            return null;
        }

        return JSON.parse(lockDataStr as string);
    } catch (error) {
        console.error('[Inventory] Get lock status failed:', error);
        return null;
    }
}

/**
 * Extend lock duration (for payments taking longer)
 */
export async function extendLock(lockId: string, additionalSeconds: number = 300): Promise<boolean> {
    try {
        const lockDataStr = await redis.get(lockId);

        if (!lockDataStr) {
            return false;
        }

        const lockData: TicketLock = JSON.parse(lockDataStr as string);
        lockData.expiresAt = Date.now() + (additionalSeconds * 1000);

        // Update lock with new expiration
        await redis.set(lockId, JSON.stringify(lockData), { ex: additionalSeconds });

        console.log(`[Inventory] Extended lock ${lockId} by ${additionalSeconds}s`);

        return true;
    } catch (error) {
        console.error('[Inventory] Extend failed:', error);
        return false;
    }
}
