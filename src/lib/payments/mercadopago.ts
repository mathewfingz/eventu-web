/**
 * MercadoPago Payment Integration
 * 
 * Documentation: https://www.mercadopago.com.co/developers/
 * 
 * API credentials should be configured in .env.local:
 * - MERCADOPAGO_ACCESS_TOKEN
 * - MERCADOPAGO_PUBLIC_KEY
 * - MERCADOPAGO_WEBHOOK_SECRET
 */

import { getPaymentConfig } from './config';
import {
    CreatePaymentRequest,
    PaymentResult,
    PaymentIntent,
    RefundRequest,
    RefundResult
} from './types';
import crypto from 'crypto';

const config = getPaymentConfig().mercadopago;

const API_BASE_URL = 'https://api.mercadopago.com';

/**
 * Create a MercadoPago preference (Checkout Pro)
 */
export async function createMercadoPagoPayment(
    request: CreatePaymentRequest
): Promise<PaymentResult> {
    // Return mock if not configured
    if (!config.enabled) {
        return createMockPayment(request);
    }

    try {
        const items = [{
            id: request.orderId,
            title: request.description || `Boletas Eventu - Orden ${request.orderId}`,
            quantity: 1,
            unit_price: request.amount,
            currency_id: 'COP',
        }];

        const preference = {
            items,
            payer: {
                email: request.customerEmail,
                name: request.customerName,
                phone: request.customerPhone ? { number: request.customerPhone } : undefined,
            },
            back_urls: {
                success: request.successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
                failure: request.failureUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending`,
            },
            auto_return: 'approved',
            external_reference: request.orderId,
            notification_url: request.webhookUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
            statement_descriptor: 'EVENTU',
            expires: true,
            expiration_date_from: new Date().toISOString(),
            expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        };

        const response = await fetch(`${API_BASE_URL}/checkout/preferences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.accessToken}`,
                'X-Idempotency-Key': request.orderId,
            },
            body: JSON.stringify(preference),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: {
                    code: data.error || 'MERCADOPAGO_ERROR',
                    message: data.message || 'Error al crear pago en MercadoPago',
                },
            };
        }

        const paymentIntent: PaymentIntent = {
            id: data.id,
            orderId: request.orderId,
            amount: request.amount,
            currency: 'COP',
            status: 'pending',
            provider: 'mercadopago',
            method: 'mercadopago',
            externalId: data.id,
            redirectUrl: config.testMode ? data.sandbox_init_point : data.init_point,
            description: request.description,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };

        return {
            success: true,
            paymentIntent,
        };
    } catch (error) {
        console.error('[MercadoPago] Payment creation failed:', error);
        return {
            success: false,
            error: {
                code: 'MERCADOPAGO_REQUEST_FAILED',
                message: 'Error de conexión con MercadoPago',
            },
        };
    }
}

/**
 * Get payment details from MercadoPago
 */
export async function getMercadoPagoPayment(
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
                provider: 'mercadopago',
                method: 'mercadopago',
                createdAt: new Date(),
            },
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: {
                    code: data.error || 'MERCADOPAGO_ERROR',
                    message: data.message || 'Error al obtener pago',
                },
            };
        }

        // Map MercadoPago status to our status
        let status: PaymentIntent['status'] = 'pending';
        switch (data.status) {
            case 'approved':
                status = 'approved';
                break;
            case 'rejected':
                status = 'rejected';
                break;
            case 'cancelled':
                status = 'cancelled';
                break;
            case 'refunded':
                status = 'refunded';
                break;
            case 'in_process':
            case 'pending':
                status = 'processing';
                break;
        }

        return {
            success: true,
            paymentIntent: {
                id: data.id.toString(),
                orderId: data.external_reference || '',
                amount: data.transaction_amount,
                currency: data.currency_id,
                status,
                provider: 'mercadopago',
                method: data.payment_method_id || 'mercadopago',
                externalId: data.id.toString(),
                createdAt: new Date(data.date_created),
                paidAt: status === 'approved' ? new Date(data.date_approved) : undefined,
            },
        };
    } catch (error) {
        console.error('[MercadoPago] Get payment failed:', error);
        return {
            success: false,
            error: {
                code: 'MERCADOPAGO_REQUEST_FAILED',
                message: 'Error al obtener información del pago',
            },
        };
    }
}

/**
 * Create refund in MercadoPago
 */
export async function refundMercadoPagoPayment(
    request: RefundRequest
): Promise<RefundResult> {
    if (!config.enabled) {
        return {
            success: true,
            refundId: `mock_refund_${Date.now()}`,
            amount: request.amount,
        };
    }

    try {
        const body: Record<string, unknown> = {};
        if (request.amount) {
            body.amount = request.amount;
        }

        const response = await fetch(
            `${API_BASE_URL}/v1/payments/${request.paymentId}/refunds`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.accessToken}`,
                    'X-Idempotency-Key': `refund_${request.paymentId}_${Date.now()}`,
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: {
                    code: data.error || 'MERCADOPAGO_REFUND_ERROR',
                    message: data.message || 'Error al procesar reembolso',
                },
            };
        }

        return {
            success: true,
            refundId: data.id.toString(),
            amount: data.amount,
        };
    } catch (error) {
        console.error('[MercadoPago] Refund failed:', error);
        return {
            success: false,
            error: {
                code: 'MERCADOPAGO_REQUEST_FAILED',
                message: 'Error al procesar reembolso',
            },
        };
    }
}

/**
 * Verify MercadoPago webhook signature
 */
export function verifyMercadoPagoWebhook(
    xSignature: string,
    xRequestId: string,
    dataId: string
): boolean {
    if (!config.webhookSecret) {
        console.warn('[MercadoPago] Webhook secret not configured');
        return false;
    }

    // Parse x-signature header
    const parts = xSignature.split(',');
    const signatureMap: Record<string, string> = {};

    for (const part of parts) {
        const [key, value] = part.split('=');
        signatureMap[key.trim()] = value.trim();
    }

    const ts = signatureMap['ts'];
    const v1 = signatureMap['v1'];

    if (!ts || !v1) {
        return false;
    }

    // Create manifest
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // Calculate HMAC
    const expectedSignature = crypto
        .createHmac('sha256', config.webhookSecret)
        .update(manifest)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(v1),
        Buffer.from(expectedSignature)
    );
}

/**
 * Create mock payment for testing when API not configured
 */
function createMockPayment(request: CreatePaymentRequest): PaymentResult {
    console.log('[MercadoPago] Using mock payment - API not configured');

    const mockId = `mock_mp_${Date.now()}`;

    return {
        success: true,
        paymentIntent: {
            id: mockId,
            orderId: request.orderId,
            amount: request.amount,
            currency: 'COP',
            status: 'pending',
            provider: 'mercadopago',
            method: 'mercadopago',
            externalId: mockId,
            redirectUrl: `/checkout/mock?order=${request.orderId}&amount=${request.amount}`,
            description: request.description,
            metadata: { mock: true },
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
    };
}
