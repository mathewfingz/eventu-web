/**
 * Cobru Payment Integration
 * 
 * Supports: PSE, Daviplata, Efecty, Baloto
 * Documentation: https://docs.cobru.co/
 * 
 * API credentials should be configured in .env.local:
 * - COBRU_API_URL
 * - COBRU_API_KEY
 * - COBRU_SECRET_KEY
 * - COBRU_WEBHOOK_SECRET
 */

import { getPaymentConfig, PaymentMethod } from './config';
import {
    CreatePaymentRequest,
    PaymentResult,
    PaymentIntent,
} from './types';
import crypto from 'crypto';

const config = getPaymentConfig().cobru;

type CobruMethod = 'pse' | 'efecty' | 'daviplata' | 'baloto';

/**
 * Create a Cobru payment link
 */
export async function createCobruPayment(
    request: CreatePaymentRequest,
    method: CobruMethod = 'pse'
): Promise<PaymentResult> {
    // Return mock if not configured
    if (!config.enabled) {
        return createMockPayment(request, method);
    }

    try {
        const payload = {
            amount: request.amount,
            currency: 'COP',
            description: request.description || `Boletas Eventu - Orden ${request.orderId}`,
            reference: request.orderId,
            payment_method: method,
            customer: {
                email: request.customerEmail,
                name: request.customerName,
                phone: request.customerPhone,
                document_type: 'CC',
                document_number: request.customerDocument,
            },
            redirect_url: request.successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
            webhook_url: request.webhookUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/cobru`,
            metadata: request.metadata,
        };

        // Generate signature
        const timestamp = Date.now().toString();
        const signature = generateCobruSignature(payload, timestamp);

        const response = await fetch(`${config.apiUrl}/v1/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': config.apiKey,
                'X-Timestamp': timestamp,
                'X-Signature': signature,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            return {
                success: false,
                error: {
                    code: data.error_code || 'COBRU_ERROR',
                    message: data.error_message || 'Error al crear pago en Cobru',
                },
            };
        }

        const paymentIntent: PaymentIntent = {
            id: data.payment_id,
            orderId: request.orderId,
            amount: request.amount,
            currency: 'COP',
            status: 'pending',
            provider: 'cobru',
            method,
            externalId: data.payment_id,
            redirectUrl: data.payment_url,
            description: request.description,
            createdAt: new Date(),
            expiresAt: getExpirationDate(method),
        };

        return {
            success: true,
            paymentIntent,
        };
    } catch (error) {
        console.error('[Cobru] Payment creation failed:', error);
        return {
            success: false,
            error: {
                code: 'COBRU_REQUEST_FAILED',
                message: 'Error de conexión con Cobru',
            },
        };
    }
}

/**
 * Get PSE banks list
 */
export async function getPSEBanks(): Promise<{ code: string; name: string }[]> {
    if (!config.enabled) {
        // Return mock banks
        return [
            { code: 'BANCOLOMBIA', name: 'Bancolombia' },
            { code: 'DAVIVIENDA', name: 'Davivienda' },
            { code: 'BBVA', name: 'BBVA' },
            { code: 'POPULAR', name: 'Banco Popular' },
            { code: 'BOGOTA', name: 'Banco de Bogotá' },
            { code: 'OCCIDENTE', name: 'Banco de Occidente' },
            { code: 'AVVILLAS', name: 'AV Villas' },
            { code: 'NEQUI', name: 'Nequi' },
        ];
    }

    try {
        const response = await fetch(`${config.apiUrl}/v1/pse/banks`, {
            headers: {
                'X-Api-Key': config.apiKey,
            },
        });

        const data = await response.json();
        return data.banks || [];
    } catch (error) {
        console.error('[Cobru] Get banks failed:', error);
        return [];
    }
}

/**
 * Get Cobru payment status
 */
export async function getCobruPaymentStatus(
    paymentId: string
): Promise<PaymentResult> {
    if (!config.enabled) {
        return {
            success: true,
            paymentIntent: {
                id: paymentId,
                orderId: '',
                amount: 0,
                currency: 'COP',
                status: 'pending',
                provider: 'cobru',
                method: 'pse',
                createdAt: new Date(),
            },
        };
    }

    try {
        const response = await fetch(`${config.apiUrl}/v1/payments/${paymentId}`, {
            headers: {
                'X-Api-Key': config.apiKey,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: {
                    code: data.error_code || 'COBRU_ERROR',
                    message: data.error_message || 'Error al obtener pago',
                },
            };
        }

        // Map Cobru status to our status
        let status: PaymentIntent['status'] = 'pending';
        switch (data.status) {
            case 'APPROVED':
            case 'COMPLETED':
                status = 'approved';
                break;
            case 'REJECTED':
            case 'FAILED':
                status = 'rejected';
                break;
            case 'CANCELLED':
                status = 'cancelled';
                break;
            case 'EXPIRED':
                status = 'expired';
                break;
            case 'PENDING':
            case 'PROCESSING':
                status = 'processing';
                break;
        }

        return {
            success: true,
            paymentIntent: {
                id: data.payment_id,
                orderId: data.reference,
                amount: data.amount,
                currency: 'COP',
                status,
                provider: 'cobru',
                method: data.payment_method,
                externalId: data.payment_id,
                createdAt: new Date(data.created_at),
                paidAt: status === 'approved' ? new Date(data.paid_at) : undefined,
            },
        };
    } catch (error) {
        console.error('[Cobru] Get status failed:', error);
        return {
            success: false,
            error: {
                code: 'COBRU_REQUEST_FAILED',
                message: 'Error al obtener estado del pago',
            },
        };
    }
}

/**
 * Verify Cobru webhook signature
 */
export function verifyCobruWebhook(
    payload: string,
    signature: string,
    timestamp: string
): boolean {
    if (!config.webhookSecret) {
        console.warn('[Cobru] Webhook secret not configured');
        return false;
    }

    const expectedSignature = crypto
        .createHmac('sha256', config.webhookSecret)
        .update(`${timestamp}.${payload}`)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

/**
 * Generate HMAC signature for Cobru API
 */
function generateCobruSignature(payload: object, timestamp: string): string {
    const data = `${timestamp}.${JSON.stringify(payload)}`;
    return crypto
        .createHmac('sha256', config.secretKey)
        .update(data)
        .digest('hex');
}

/**
 * Get expiration date based on payment method
 */
function getExpirationDate(method: CobruMethod): Date {
    const now = Date.now();

    switch (method) {
        case 'pse':
            return new Date(now + 15 * 60 * 1000); // 15 minutes
        case 'efecty':
        case 'baloto':
            return new Date(now + 72 * 60 * 60 * 1000); // 72 hours
        case 'daviplata':
            return new Date(now + 30 * 60 * 1000); // 30 minutes
        default:
            return new Date(now + 24 * 60 * 60 * 1000); // 24 hours
    }
}

/**
 * Create mock payment for testing when API not configured
 */
function createMockPayment(
    request: CreatePaymentRequest,
    method: CobruMethod
): PaymentResult {
    console.log(`[Cobru] Using mock ${method} payment - API not configured`);

    const mockId = `mock_cobru_${method}_${Date.now()}`;

    return {
        success: true,
        paymentIntent: {
            id: mockId,
            orderId: request.orderId,
            amount: request.amount,
            currency: 'COP',
            status: 'pending',
            provider: 'cobru',
            method,
            externalId: mockId,
            redirectUrl: `/checkout/mock?order=${request.orderId}&method=${method}&amount=${request.amount}`,
            description: request.description,
            metadata: { mock: true },
            createdAt: new Date(),
            expiresAt: getExpirationDate(method),
        },
    };
}
