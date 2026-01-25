/**
 * Nequi Payment Integration
 * 
 * Documentation: https://conecta.nequi.com/
 * 
 * API credentials should be configured in .env.local:
 * - NEQUI_API_URL
 * - NEQUI_CLIENT_ID
 * - NEQUI_CLIENT_SECRET
 * - NEQUI_API_KEY
 * - NEQUI_WEBHOOK_SECRET
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

const config = getPaymentConfig().nequi;

/**
 * Get OAuth token for Nequi API
 */
async function getAccessToken(): Promise<string | null> {
    if (!config.enabled) {
        console.warn('[Nequi] API not configured. Add credentials to .env.local');
        return null;
    }

    try {
        const response = await fetch(`${config.apiUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            throw new Error(`Token request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('[Nequi] Failed to get access token:', error);
        return null;
    }
}

/**
 * Create a Nequi payment with QR code
 */
export async function createNequiPayment(
    request: CreatePaymentRequest
): Promise<PaymentResult> {
    // Return mock if not configured
    if (!config.enabled) {
        return createMockPayment(request);
    }

    const token = await getAccessToken();
    if (!token) {
        return {
            success: false,
            error: {
                code: 'NEQUI_AUTH_FAILED',
                message: 'No se pudo autenticar con Nequi',
            },
        };
    }

    try {
        const messageId = crypto.randomUUID();

        const payload = {
            RequestMessage: {
                RequestHeader: {
                    Channel: 'PQR03-C001',
                    RequestDate: new Date().toISOString(),
                    MessageID: messageId,
                    ClientID: config.clientId,
                    Destination: {
                        ServiceName: 'PaymentsService',
                        ServiceOperation: 'generateCodeQR',
                        ServiceRegion: 'C001',
                        ServiceVersion: '1.0.0',
                    },
                },
                RequestBody: {
                    any: {
                        generateCodeQRRQ: {
                            code: request.orderId,
                            value: request.amount.toString(),
                            reference1: request.description || `Orden ${request.orderId}`,
                            reference2: request.customerEmail,
                            reference3: request.customerPhone || '',
                        },
                    },
                },
            },
        };

        const response = await fetch(
            `${config.apiUrl}/payments/v2/-services-paymentservice-generatecodeqr`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-api-key': config.apiKey,
                },
                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();

        if (!response.ok || data.ResponseMessage?.ResponseHeader?.Status?.StatusCode !== '0') {
            return {
                success: false,
                error: {
                    code: data.ResponseMessage?.ResponseHeader?.Status?.StatusCode || 'NEQUI_ERROR',
                    message: data.ResponseMessage?.ResponseHeader?.Status?.StatusDesc || 'Error al crear pago',
                },
            };
        }

        const qrData = data.ResponseMessage?.ResponseBody?.any?.generateCodeQRRS;

        const paymentIntent: PaymentIntent = {
            id: messageId,
            orderId: request.orderId,
            amount: request.amount,
            currency: 'COP',
            status: 'pending',
            provider: 'nequi',
            method: 'nequi',
            externalId: qrData?.codeQR,
            qrCode: qrData?.codeQR,
            qrCodeBase64: qrData?.codeQRBase64,
            description: request.description,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        };

        return {
            success: true,
            paymentIntent,
        };
    } catch (error) {
        console.error('[Nequi] Payment creation failed:', error);
        return {
            success: false,
            error: {
                code: 'NEQUI_REQUEST_FAILED',
                message: 'Error de conexión con Nequi',
            },
        };
    }
}

/**
 * Check Nequi payment status
 */
export async function checkNequiPaymentStatus(
    codeQR: string
): Promise<PaymentResult> {
    if (!config.enabled) {
        return {
            success: true,
            paymentIntent: {
                id: codeQR,
                orderId: '',
                amount: 0,
                currency: 'COP',
                status: 'pending',
                provider: 'nequi',
                method: 'nequi',
                createdAt: new Date(),
            },
        };
    }

    const token = await getAccessToken();
    if (!token) {
        return {
            success: false,
            error: {
                code: 'NEQUI_AUTH_FAILED',
                message: 'No se pudo autenticar con Nequi',
            },
        };
    }

    try {
        const messageId = crypto.randomUUID();

        const payload = {
            RequestMessage: {
                RequestHeader: {
                    Channel: 'PQR03-C001',
                    RequestDate: new Date().toISOString(),
                    MessageID: messageId,
                    ClientID: config.clientId,
                    Destination: {
                        ServiceName: 'PaymentsService',
                        ServiceOperation: 'getStatusPayment',
                        ServiceRegion: 'C001',
                        ServiceVersion: '1.0.0',
                    },
                },
                RequestBody: {
                    any: {
                        getStatusPaymentRQ: {
                            codeQR,
                        },
                    },
                },
            },
        };

        const response = await fetch(
            `${config.apiUrl}/payments/v2/-services-paymentservice-getstatuspayment`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-api-key': config.apiKey,
                },
                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();
        const statusData = data.ResponseMessage?.ResponseBody?.any?.getStatusPaymentRS;

        // Map Nequi status to our status
        let status: PaymentIntent['status'] = 'pending';
        if (statusData?.status === '35') status = 'approved';
        else if (statusData?.status === '36') status = 'rejected';
        else if (statusData?.status === '37') status = 'expired';

        return {
            success: true,
            paymentIntent: {
                id: messageId,
                orderId: statusData?.code || '',
                amount: parseFloat(statusData?.value || '0'),
                currency: 'COP',
                status,
                provider: 'nequi',
                method: 'nequi',
                externalId: codeQR,
                createdAt: new Date(),
                paidAt: status === 'approved' ? new Date() : undefined,
            },
        };
    } catch (error) {
        console.error('[Nequi] Status check failed:', error);
        return {
            success: false,
            error: {
                code: 'NEQUI_REQUEST_FAILED',
                message: 'Error al verificar estado del pago',
            },
        };
    }
}

/**
 * Verify Nequi webhook signature
 */
export function verifyNequiWebhook(
    payload: string,
    signature: string
): boolean {
    if (!config.webhookSecret) {
        console.warn('[Nequi] Webhook secret not configured');
        return false;
    }

    const expectedSignature = crypto
        .createHmac('sha256', config.webhookSecret)
        .update(payload)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

/**
 * Create mock payment for testing when API not configured
 */
function createMockPayment(request: CreatePaymentRequest): PaymentResult {
    console.log('[Nequi] Using mock payment - API not configured');

    const mockId = `mock_nequi_${Date.now()}`;

    return {
        success: true,
        paymentIntent: {
            id: mockId,
            orderId: request.orderId,
            amount: request.amount,
            currency: 'COP',
            status: 'pending',
            provider: 'nequi',
            method: 'nequi',
            externalId: mockId,
            qrCode: `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${mockId}`,
            description: request.description,
            metadata: { mock: true },
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
    };
}
