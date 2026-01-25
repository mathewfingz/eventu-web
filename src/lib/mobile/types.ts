/**
 * Mobile SDK Types
 * 
 * TypeScript types that should be mirrored in Swift/Kotlin
 * for iOS and Android app development.
 * 
 * These types define the contract between web APIs and mobile apps.
 */

// ============================================
// API Response Wrapper
// ============================================

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    timestamp: number;
}

// ============================================
// Authentication
// ============================================

export interface MobileUser {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    phone?: string;
    role: UserRole;
    createdAt: string;
}

export type UserRole = 'USER' | 'ORGANIZER' | 'ADMIN' | 'COORDINATOR' | 'VENUE_MANAGER';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
}

// ============================================
// Events
// ============================================

export interface MobileEvent {
    id: string;
    name: string;
    slug: string;
    description: string;
    date: string; // ISO 8601
    doorsOpen?: string;
    endDate?: string;
    imageUrl: string;
    bannerUrl?: string;
    venue: MobileVenue;
    category: string;
    status: EventStatus;
    minPrice: number;
    maxPrice: number;
    isSoldOut: boolean;
    hasPresale: boolean;
    presaleEndsAt?: string;
    isFavorite: boolean;
    ticketTypes?: MobileTicketType[];
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ON_SALE' | 'SOLD_OUT' | 'CANCELLED' | 'COMPLETED';

export interface MobileVenue {
    id: string;
    name: string;
    address: string;
    city: string;
    state?: string;
    country: string;
    latitude?: number;
    longitude?: number;
    capacity: number;
    imageUrl?: string;
    mapsUrl?: string;
}

export interface MobileTicketType {
    id: string;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    serviceFee: number;
    available: number;
    maxPerOrder: number;
    section?: string;
    row?: string;
    benefits?: string[];
    isPresale: boolean;
    saleStartsAt?: string;
    saleEndsAt?: string;
}

// ============================================
// Tickets & Orders
// ============================================

export interface MobileTicket {
    id: string;
    orderId: string;
    event: MobileEventSummary;
    ticketType: string;
    section?: string;
    row?: string;
    seat?: string;
    status: TicketStatus;
    qrCodeUrl: string;
    safetixSecret?: string; // For offline code generation
    holderName: string;
    holderEmail: string;
    purchasedAt: string;
    usedAt?: string;
}

export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED' | 'TRANSFERRED' | 'EXPIRED';

export interface MobileEventSummary {
    id: string;
    name: string;
    date: string;
    imageUrl: string;
    venueName: string;
    venueCity: string;
}

export interface MobileOrder {
    id: string;
    userId: string;
    event: MobileEventSummary;
    tickets: MobileTicket[];
    subtotal: number;
    serviceFee: number;
    iva: number;
    total: number;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    paidAt?: string;
    createdAt: string;
}

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

// ============================================
// SafeTix
// ============================================

export interface SafeTixCode {
    ticketId: string;
    code: string;
    validFrom: number; // Unix timestamp
    validUntil: number;
    isOffline: boolean;
}

export interface SafeTixValidationRequest {
    ticketId: string;
    code: string;
}

export interface SafeTixValidationResponse {
    valid: boolean;
    ticket?: {
        id: string;
        holderName: string;
        ticketType: string;
        section?: string;
        seat?: string;
    };
    error?: string;
}

// ============================================
// Presales
// ============================================

export interface PresaleValidationRequest {
    eventId: string;
    type: PresaleRuleType;
    value?: string; // Code, BIN, wallet address
}

export type PresaleRuleType = 'CODE' | 'BIN' | 'EMAIL_DOMAIN' | 'NFT' | 'SUBSCRIPTION';

export interface PresaleValidationResponse {
    valid: boolean;
    presale?: {
        id: string;
        name: string;
        discountPercent?: number;
        discountAmount?: number;
        endsAt: string;
    };
    error?: string;
}

// ============================================
// Analytics (for iOS widget)
// ============================================

export interface MobileAnalyticsEvent {
    type: AnalyticsEventType;
    sessionId: string;
    eventId?: string;
    ticketTypeId?: string;
    orderId?: string;
    metadata?: Record<string, any>;
    platform: 'ios' | 'android';
    appVersion: string;
}

export type AnalyticsEventType =
    | 'APP_OPEN'
    | 'PAGE_VIEW'
    | 'EVENT_VIEW'
    | 'TICKET_SELECT'
    | 'CHECKOUT_START'
    | 'CHECKOUT_COMPLETE'
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILED'
    | 'TICKET_VALIDATED'
    | 'PUSH_RECEIVED'
    | 'PUSH_OPENED';

// For iOS widget
export interface WidgetData {
    eventId: string;
    eventName: string;
    eventDate: string;
    ticketsSold: number;
    ticketsRemaining: number;
    revenue: number;
    activeUsers: number;
    lastUpdated: string;
}

// ============================================
// Chat
// ============================================

export interface ChatMessageRequest {
    message: string;
    sessionId: string;
    eventId?: string;
    orderId?: string;
    ticketId?: string;
    previousMessages?: MobileChatMessage[];
    platform: 'ios' | 'android';
}

export interface MobileChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    suggestedActions?: ChatAction[];
}

export interface ChatAction {
    type: 'link' | 'button' | 'quick_reply';
    label: string;
    value: string;
}

// ============================================
// Push Notifications
// ============================================

export interface PushNotificationPayload {
    title: string;
    body: string;
    data?: {
        type: PushNotificationType;
        eventId?: string;
        ticketId?: string;
        orderId?: string;
        url?: string;
    };
}

export type PushNotificationType =
    | 'TICKET_READY'
    | 'EVENT_REMINDER'
    | 'EVENT_STARTING'
    | 'PRESALE_STARTING'
    | 'ORDER_CONFIRMED'
    | 'REFUND_PROCESSED'
    | 'PRICE_DROP'
    | 'GENERAL';

// ============================================
// Offline Support
// ============================================

export interface OfflineTicketData {
    ticketId: string;
    eventId: string;
    eventName: string;
    eventDate: string;
    safetixSecret: string;
    offlineCodes: {
        timestamp: number;
        code: string;
    }[];
    downloadedAt: string;
    expiresAt: string;
}

export interface OfflineSyncRequest {
    analyticsEvents: MobileAnalyticsEvent[];
    lastSyncedAt: string;
}

// ============================================
// API Endpoints Reference
// ============================================

/**
 * API Endpoints for iOS/Android consumption:
 * 
 * Auth:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/refresh
 * - POST /api/auth/logout
 * 
 * Events:
 * - GET /api/events
 * - GET /api/events/[slug]
 * - GET /api/events/[eventId]/tickets
 * - POST /api/events/[eventId]/favorite
 * - DELETE /api/events/[eventId]/favorite
 * 
 * Tickets:
 * - GET /api/tickets (user's tickets)
 * - GET /api/tickets/[ticketId]
 * - GET /api/tickets/[ticketId]/qr
 * - POST /api/tickets/validate
 * - GET /api/tickets/[ticketId]/offline
 * 
 * Orders:
 * - GET /api/orders
 * - GET /api/orders/[orderId]
 * - POST /api/orders/create
 * 
 * Payments:
 * - POST /api/payments/create
 * - GET /api/payments/[paymentId]/status
 * 
 * Presales:
 * - POST /api/presale/validate
 * 
 * Chat:
 * - POST /api/chat
 * - GET /api/chat?sessionId=xxx
 * 
 * Analytics:
 * - POST /api/analytics/track
 * - POST /api/analytics/batch
 * - GET /api/analytics/realtime/[eventId] (widget)
 * 
 * Queue:
 * - POST /api/events/[eventId]/queue/join
 * - GET /api/events/[eventId]/queue/status
 */
