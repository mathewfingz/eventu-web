/**
 * Inventory Service - Unified API
 * 
 * Re-exports all inventory management functionality
 */

// Lock system
export {
    initializeInventory,
    getAvailableInventory,
    lockTickets,
    releaseTicketLock,
    releaseSessionLocks,
    confirmLock,
    getLockStatus,
    extendLock,
    type TicketLock,
    type LockResult,
    type ReleaseResult,
} from './locks';

// Virtual queue
export {
    activateQueue,
    deactivateQueue,
    isQueueActive,
    joinQueue,
    getQueuePosition,
    admitNextBatch,
    verifyAdmission,
    getQueueStatus,
    leaveQueue,
    type QueueEntry,
    type QueueStatus,
} from './queue';

// Holds system
export {
    createHold,
    claimHold,
    releaseHold,
    getEventHolds,
    releaseExpiredHolds,
    type Hold,
    type HoldType,
    type CreateHoldRequest,
    type HoldResult,
} from './holds';

/**
 * High-level checkout flow with inventory management
 */
export async function startCheckout(
    ticketTypeId: string,
    quantity: number,
    sessionId: string,
    userId?: string
): Promise<{
    success: boolean;
    lockId?: string;
    expiresAt?: number;
    error?: string;
}> {
    const { lockTickets } = await import('./locks');

    const result = await lockTickets(ticketTypeId, quantity, sessionId, userId);

    if (!result.success) {
        return {
            success: false,
            error: result.error?.message || 'No se pudieron reservar las boletas',
        };
    }

    return {
        success: true,
        lockId: result.lock?.lockId,
        expiresAt: result.lock?.expiresAt,
    };
}

/**
 * Complete checkout after payment success
 */
export async function completeCheckout(lockId: string): Promise<boolean> {
    const { confirmLock } = await import('./locks');
    return confirmLock(lockId);
}

/**
 * Cancel checkout and release inventory
 */
export async function cancelCheckout(lockId: string): Promise<boolean> {
    const { releaseTicketLock } = await import('./locks');
    const result = await releaseTicketLock(lockId);
    return result.success;
}
