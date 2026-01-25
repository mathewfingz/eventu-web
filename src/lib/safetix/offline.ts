/**
 * SafeTix Offline Data Manager
 * 
 * Handles storage and retrieval of offline QR codes for tickets
 * Uses IndexedDB for larger storage capacity and better performance
 */

const DB_NAME = 'safetix_offline';
const DB_VERSION = 1;
const STORE_NAME = 'tickets';

interface OfflineTicketData {
    ticketId: string;
    eventId: string;
    eventName: string;
    ticketType: string;
    section?: string;
    seatRow?: string;
    seatNumber?: string;
    codes: { code: string; validUntil: number }[];
    downloadedAt: number;
    expiresAt: number;
}

/**
 * Open IndexedDB connection
 */
function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'ticketId' });
                store.createIndex('eventId', 'eventId', { unique: false });
                store.createIndex('expiresAt', 'expiresAt', { unique: false });
            }
        };
    });
}

/**
 * Save ticket data for offline use
 */
export async function saveOfflineTicket(data: OfflineTicketData): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const request = store.put(data);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * Get offline ticket data
 */
export async function getOfflineTicket(ticketId: string): Promise<OfflineTicketData | null> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        const request = store.get(ticketId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
    });
}

/**
 * Get all offline tickets
 */
export async function getAllOfflineTickets(): Promise<OfflineTicketData[]> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || []);
    });
}

/**
 * Remove offline ticket data
 */
export async function removeOfflineTicket(ticketId: string): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const request = store.delete(ticketId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * Clean up expired offline tickets
 */
export async function cleanupExpiredTickets(): Promise<number> {
    const db = await openDatabase();
    const now = Date.now();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('expiresAt');

        const range = IDBKeyRange.upperBound(now);
        const request = index.openCursor(range);

        let deletedCount = 0;

        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;

            if (cursor) {
                cursor.delete();
                deletedCount++;
                cursor.continue();
            } else {
                resolve(deletedCount);
            }
        };
    });
}

/**
 * Estimate storage usage
 */
export async function getStorageEstimate(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
            used: estimate.usage || 0,
            available: estimate.quota || 0,
        };
    }

    return { used: 0, available: 0 };
}

/**
 * Download ticket for offline use
 */
export async function downloadTicketForOffline(ticketId: string): Promise<boolean> {
    try {
        // Fetch ticket data with offline codes
        const response = await fetch(`/api/tickets/${ticketId}/qr?offline=true`);

        if (!response.ok) {
            throw new Error('Failed to fetch offline codes');
        }

        const data = await response.json();

        // Get ticket info
        const ticketResponse = await fetch(`/api/tickets/${ticketId}`);
        const ticketData = await ticketResponse.json();

        // Save to IndexedDB
        await saveOfflineTicket({
            ticketId,
            eventId: ticketData.ticket?.eventId || '',
            eventName: ticketData.ticket?.eventName || 'Evento',
            ticketType: ticketData.ticket?.type || 'General',
            section: ticketData.ticket?.section,
            seatRow: ticketData.ticket?.seatRow,
            seatNumber: ticketData.ticket?.seatNumber,
            codes: data.offlineCodes || [],
            downloadedAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        });

        return true;
    } catch (error) {
        console.error('[SafeTix:Offline] Download failed:', error);
        return false;
    }
}

/**
 * Check if ticket is available offline
 */
export async function isTicketAvailableOffline(ticketId: string): Promise<boolean> {
    const data = await getOfflineTicket(ticketId);

    if (!data) return false;

    // Check if not expired
    if (data.expiresAt < Date.now()) {
        await removeOfflineTicket(ticketId);
        return false;
    }

    // Check if has valid codes
    const now = Date.now();
    const hasValidCodes = data.codes.some(c => c.validUntil > now);

    return hasValidCodes;
}
