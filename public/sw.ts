/// <reference lib="webworker" />

/**
 * EVENTU Service Worker
 *
 * Caching strategies:
 * - Network First: API calls, dynamic data
 * - Cache First: Static assets, fonts
 * - Stale While Revalidate: Event listings, images
 * - Offline First: Tickets & SafeTix QR codes
 */

declare const self: ServiceWorkerGlobalScope;

// Extended types for Background Sync API
interface SyncEvent extends ExtendableEvent {
    tag: string;
    lastChance: boolean;
}

interface ServiceWorkerGlobalScopeEventMap {
    sync: SyncEvent;
}

const CACHE_VERSION = 'v1.0.0';
const CACHES = {
    STATIC: `eventu-static-${CACHE_VERSION}`,
    DYNAMIC: `eventu-dynamic-${CACHE_VERSION}`,
    TICKETS: `eventu-tickets-${CACHE_VERSION}`,
    IMAGES: `eventu-images-${CACHE_VERSION}`,
};

// Static assets to precache
const PRECACHE_ASSETS = [
    '/',
    '/offline',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/fonts/poppins-regular.woff2',
    '/fonts/poppins-semibold.woff2',
];

// Routes that work offline
const OFFLINE_ROUTES = [
    '/dashboard/tickets',
    '/tickets',
];

/**
 * Install Event - Precache static assets
 */
self.addEventListener('install', (event: ExtendableEvent) => {
    console.log('[SW] Installing...');

    event.waitUntil(
        caches.open(CACHES.STATIC).then((cache) => {
            console.log('[SW] Precaching static assets');
            return cache.addAll(PRECACHE_ASSETS);
        })
    );

    // Activate immediately
    self.skipWaiting();
});

/**
 * Activate Event - Clean old caches
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
    console.log('[SW] Activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => !Object.values(CACHES).includes(name))
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );

    // Take control immediately
    self.clients.claim();
});

/**
 * Fetch Event - Apply caching strategies
 */
self.addEventListener('fetch', (event: FetchEvent) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests
    if (!url.origin.includes(self.location.origin)) return;

    // Apply strategies based on URL pattern
    if (isTicketResource(url)) {
        event.respondWith(ticketsFirstStrategy(request));
    } else if (isAPIRequest(url)) {
        event.respondWith(networkFirstStrategy(request));
    } else if (isStaticAsset(url)) {
        event.respondWith(cacheFirstStrategy(request));
    } else if (isImageRequest(url)) {
        event.respondWith(staleWhileRevalidate(request, CACHES.IMAGES));
    } else {
        event.respondWith(staleWhileRevalidate(request, CACHES.DYNAMIC));
    }
});

/**
 * Push Event - Handle push notifications
 */
self.addEventListener('push', (event: PushEvent) => {
    console.log('[SW] Push received');

    const data = event.data?.json() ?? {};

    // Extended notification options for PWA
    const options = {
        body: data.body || 'Nueva notificación de Eventu',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
            ...data,
        },
        actions: data.actions || [],
        tag: data.tag || 'eventu-notification',
        requireInteraction: data.requireInteraction || false,
    } as NotificationOptions;

    event.waitUntil(
        self.registration.showNotification(data.title || 'Eventu', options)
    );
});

/**
 * Notification Click - Handle notification actions
 */
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    console.log('[SW] Notification clicked:', event.action);

    event.notification.close();

    const url = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
            // Focus existing window if available
            for (const client of clients) {
                if (client.url === url && 'focus' in client) {
                    return (client as WindowClient).focus();
                }
            }
            // Open new window
            return self.clients.openWindow(url);
        })
    );
});

/**
 * Background Sync - Retry failed requests
 */
self.addEventListener('sync', ((event: SyncEvent) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-analytics') {
        event.waitUntil(syncAnalytics());
    } else if (event.tag === 'sync-ticket-validation') {
        event.waitUntil(syncTicketValidations());
    }
}) as EventListener);

// ============ Caching Strategies ============

/**
 * Cache First - For static assets
 */
async function cacheFirstStrategy(request: Request): Promise<Response> {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHES.STATIC);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network First - For API calls
 */
async function networkFirstStrategy(request: Request): Promise<Response> {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHES.DYNAMIC);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;

        return new Response(
            JSON.stringify({ error: 'Offline', cached: false }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

/**
 * Stale While Revalidate - For dynamic content
 */
async function staleWhileRevalidate(
    request: Request,
    cacheName: string
): Promise<Response> {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => null);

    return cached || (await fetchPromise) || offlineFallback(request);
}

/**
 * Tickets First - Prioritize cached tickets for offline access
 */
async function ticketsFirstStrategy(request: Request): Promise<Response> {
    const cache = await caches.open(CACHES.TICKETS);
    const cached = await cache.match(request);

    // For ticket data, prefer cached version for instant access
    if (cached) {
        // Update in background
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    cache.put(request, response.clone());
                }
            })
            .catch(() => { });

        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return offlineFallback(request);
    }
}

// ============ Helper Functions ============

function isAPIRequest(url: URL): boolean {
    return url.pathname.startsWith('/api/');
}

function isStaticAsset(url: URL): boolean {
    return /\.(js|css|woff2?|ttf|eot)$/i.test(url.pathname);
}

function isImageRequest(url: URL): boolean {
    return /\.(png|jpg|jpeg|gif|svg|webp|avif)$/i.test(url.pathname);
}

function isTicketResource(url: URL): boolean {
    return (
        url.pathname.includes('/tickets/') ||
        url.pathname.includes('/api/tickets/') ||
        url.pathname.includes('/dashboard/tickets')
    );
}

async function offlineFallback(request: Request): Promise<Response> {
    // For HTML requests, show offline page
    if (request.headers.get('Accept')?.includes('text/html')) {
        const cached = await caches.match('/offline');
        if (cached) return cached;
    }

    return new Response('Offline', { status: 503 });
}

// ============ Background Sync Handlers ============

async function syncAnalytics(): Promise<void> {
    // Get pending analytics from IndexedDB
    const pending = await getPendingAnalytics();

    if (pending.length === 0) return;

    try {
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: pending }),
        });

        await clearPendingAnalytics();
        console.log('[SW] Analytics synced:', pending.length);
    } catch (error) {
        console.error('[SW] Analytics sync failed:', error);
    }
}

async function syncTicketValidations(): Promise<void> {
    // Get pending validations from IndexedDB
    const pending = await getPendingValidations();

    for (const validation of pending) {
        try {
            await fetch('/api/tickets/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validation),
            });

            await removePendingValidation(validation.id);
        } catch {
            console.error('[SW] Validation sync failed:', validation.id);
        }
    }
}

// IndexedDB helpers (simplified)
async function getPendingAnalytics(): Promise<any[]> {
    // Implementation would use IndexedDB
    return [];
}

async function clearPendingAnalytics(): Promise<void> {
    // Implementation would clear IndexedDB
}

async function getPendingValidations(): Promise<any[]> {
    // Implementation would use IndexedDB
    return [];
}

async function removePendingValidation(id: string): Promise<void> {
    // Implementation would remove from IndexedDB
}

export { };
