/**
 * Unified Payment Service
 * 
 * Provides a single interface to all payment providers
 */

export * from './types';
export * from './config';

import { CreatePaymentRequest, PaymentResult, RefundRequest, RefundResult } from './types';
import { getPaymentConfig, hasPaymentProvider, PaymentMethod as ConfigPaymentMethod } from './config';
import { createNequiPayment, checkNequiPaymentStatus } from './nequi';
import { createMercadoPagoPayment, getMercadoPagoPayment, refundMercadoPagoPayment } from './mercadopago';
import { createCobruPayment, getCobruPaymentStatus, getPSEBanks } from './cobru';

export type SupportedPaymentMethod =
    | 'nequi'
    | 'mercadopago'
    | 'pse'
    | 'efecty'
    | 'daviplata'
    | 'baloto';

/**
 * Create a payment using the specified method
 */
export async function createPayment(
    request: CreatePaymentRequest,
    method: SupportedPaymentMethod
): Promise<PaymentResult> {
    switch (method) {
        case 'nequi':
            return createNequiPayment(request);

        case 'mercadopago':
            return createMercadoPagoPayment(request);

        case 'pse':
            return createCobruPayment(request, 'pse');

        case 'efecty':
            return createCobruPayment(request, 'efecty');

        case 'daviplata':
            return createCobruPayment(request, 'daviplata');

        case 'baloto':
            return createCobruPayment(request, 'baloto');

        default:
            return {
                success: false,
                error: {
                    code: 'INVALID_PAYMENT_METHOD',
                    message: `Método de pago no soportado: ${method}`,
                },
            };
    }
}

/**
 * Get payment status by provider and payment ID
 */
export async function getPaymentStatus(
    provider: string,
    paymentId: string
): Promise<PaymentResult> {
    switch (provider) {
        case 'nequi':
            return checkNequiPaymentStatus(paymentId);

        case 'mercadopago':
            return getMercadoPagoPayment(paymentId);

        case 'cobru':
            return getCobruPaymentStatus(paymentId);

        default:
            return {
                success: false,
                error: {
                    code: 'INVALID_PROVIDER',
                    message: `Proveedor no soportado: ${provider}`,
                },
            };
    }
}

/**
 * Process refund
 */
export async function processRefund(
    provider: string,
    request: RefundRequest
): Promise<RefundResult> {
    switch (provider) {
        case 'mercadopago':
            return refundMercadoPagoPayment(request);

        case 'nequi':
        case 'cobru':
            // Nequi and Cobru refunds typically require manual processing
            return {
                success: false,
                error: {
                    code: 'REFUND_NOT_SUPPORTED',
                    message: 'Este proveedor requiere reembolso manual',
                },
            };

        default:
            return {
                success: false,
                error: {
                    code: 'INVALID_PROVIDER',
                    message: `Proveedor no soportado: ${provider}`,
                },
            };
    }
}

/**
 * Get available payment methods
 */
export function getAvailablePaymentMethods(): {
    method: SupportedPaymentMethod;
    label: string;
    icon: string;
    provider: string;
    available: boolean;
}[] {
    const config = getPaymentConfig();

    return [
        {
            method: 'nequi',
            label: 'Nequi',
            icon: '💜',
            provider: 'nequi',
            available: true, // Always show, uses mock if not configured
        },
        {
            method: 'mercadopago',
            label: 'Tarjeta de Crédito/Débito',
            icon: '💳',
            provider: 'mercadopago',
            available: true,
        },
        {
            method: 'pse',
            label: 'PSE (Débito Bancario)',
            icon: '🏦',
            provider: 'cobru',
            available: true,
        },
        {
            method: 'efecty',
            label: 'Efecty',
            icon: '💵',
            provider: 'cobru',
            available: true,
        },
        {
            method: 'daviplata',
            label: 'Daviplata',
            icon: '🟢',
            provider: 'cobru',
            available: true,
        },
        {
            method: 'baloto',
            label: 'Baloto',
            icon: '🎯',
            provider: 'cobru',
            available: true,
        },
    ];
}

/**
 * Re-export bank list fetching
 */
export { getPSEBanks };

/**
 * Calculate fees for a payment
 * Colombian fees structure
 */
export function calculateFees(subtotal: number): {
    subtotal: number;
    serviceFee: number;
    iva: number;
    total: number;
} {
    // Service fee: 10% of ticket price
    const serviceFee = Math.round(subtotal * 0.10);

    // IVA: 19% on service fee only (not on ticket base price for cultural events)
    const iva = Math.round(serviceFee * 0.19);

    // Total
    const total = subtotal + serviceFee + iva;

    return {
        subtotal,
        serviceFee,
        iva,
        total,
    };
}
