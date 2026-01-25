/**
 * Payment Types and Interfaces
 */

export type PaymentStatus =
    | 'pending'
    | 'processing'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'refunded'
    | 'expired';

// PaymentMethod type is defined in config.ts - use it from there

export interface PaymentIntent {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    provider: string;
    method: string;

    // Provider-specific data
    externalId?: string;
    qrCode?: string;
    qrCodeBase64?: string;
    redirectUrl?: string;

    // Metadata
    description?: string;
    metadata?: Record<string, unknown>;

    // Timestamps
    createdAt: Date;
    expiresAt?: Date;
    paidAt?: Date;
}

export interface CreatePaymentRequest {
    orderId: string;
    amount: number;
    currency?: string;
    method: string;
    description?: string;

    // Customer info
    customerEmail: string;
    customerName?: string;
    customerPhone?: string;
    customerDocument?: string;

    // URLs
    successUrl?: string;
    failureUrl?: string;
    webhookUrl?: string;

    // Additional data
    metadata?: Record<string, unknown>;
}

export interface PaymentResult {
    success: boolean;
    paymentIntent?: PaymentIntent;
    error?: {
        code: string;
        message: string;
    };
}

export interface WebhookEvent {
    id: string;
    type: string;
    provider: string;
    data: Record<string, unknown>;
    timestamp: Date;
    signature?: string;
}

export interface RefundRequest {
    paymentId: string;
    amount?: number; // Partial refund
    reason?: string;
}

export interface RefundResult {
    success: boolean;
    refundId?: string;
    amount?: number;
    error?: {
        code: string;
        message: string;
    };
}
