/**
 * Push Notifications Manager
 * 
 * Handles push notification subscription, unsubscription, and management.
 * Integrates with Supabase for storing subscriptions.
 */

// VAPID public key (generate with web-push library)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
    return 'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
}

/**
 * Check current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
    return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!isPushSupported()) {
        throw new Error('Push notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscriptionData | null> {
    if (!isPushSupported()) {
        console.error('Push not supported');
        return null;
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            // Create new subscription
            const keyArray = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: keyArray.buffer as ArrayBuffer,
            });
        }

        const subscriptionData: PushSubscriptionData = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
                auth: arrayBufferToBase64(subscription.getKey('auth')!),
            },
        };

        // Save to server
        await savePushSubscription(subscriptionData);

        console.log('Push subscription successful');
        return subscriptionData;
    } catch (error) {
        console.error('Push subscription failed:', error);
        return null;
    }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
            await deletePushSubscription(subscription.endpoint);
            console.log('Push unsubscription successful');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Push unsubscription failed:', error);
        return false;
    }
}

/**
 * Check if user is subscribed to push
 */
export async function isPushSubscribed(): Promise<boolean> {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return !!subscription;
    } catch {
        return false;
    }
}

/**
 * Save subscription to server
 */
async function savePushSubscription(
    subscription: PushSubscriptionData
): Promise<void> {
    await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
    });
}

/**
 * Delete subscription from server
 */
async function deletePushSubscription(endpoint: string): Promise<void> {
    await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
    });
}

// ============ Notification Types ============

export type NotificationType =
    | 'TICKET_PURCHASED'
    | 'EVENT_REMINDER'
    | 'EVENT_CANCELLED'
    | 'PRESALE_START'
    | 'PRICE_DROP'
    | 'TRANSFER_RECEIVED'
    | 'REFUND_PROCESSED'
    | 'SETTLEMENT_PAID'
    | 'QUEUE_ADMISSION';

export interface NotificationPayload {
    type: NotificationType;
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
    data?: Record<string, any>;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
}

/**
 * Send a local notification (for testing)
 */
export async function showLocalNotification(
    payload: NotificationPayload
): Promise<void> {
    if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
    }

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192.png',
        badge: payload.badge || '/icons/badge-72.png',
        tag: payload.tag || payload.type,
        data: {
            url: payload.url || '/',
            ...payload.data,
        },
        actions: payload.actions,
    } as NotificationOptions);
}

// ============ Helper Functions ============

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
