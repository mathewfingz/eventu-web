/**
 * Payment Provider Configuration
 * 
 * All API credentials are left open for later configuration.
 * Add your credentials to .env.local when ready.
 */

export interface PaymentProvider {
    name: string;
    enabled: boolean;
    testMode: boolean;
}

export interface PaymentConfig {
    nequi: {
        apiUrl: string;
        clientId: string;
        clientSecret: string;
        apiKey: string;
        webhookSecret: string;
        enabled: boolean;
        testMode: boolean;
    };
    mercadopago: {
        accessToken: string;
        publicKey: string;
        webhookSecret: string;
        enabled: boolean;
        testMode: boolean;
    };
    cobru: {
        apiUrl: string;
        apiKey: string;
        secretKey: string;
        webhookSecret: string;
        enabled: boolean;
        testMode: boolean;
    };
}

/**
 * Get payment configuration from environment variables
 * Returns default/mock values if credentials not configured
 */
export function getPaymentConfig(): PaymentConfig {
    return {
        nequi: {
            apiUrl: process.env.NEQUI_API_URL || 'https://api.sandbox.nequi.com',
            clientId: process.env.NEQUI_CLIENT_ID || '',
            clientSecret: process.env.NEQUI_CLIENT_SECRET || '',
            apiKey: process.env.NEQUI_API_KEY || '',
            webhookSecret: process.env.NEQUI_WEBHOOK_SECRET || '',
            enabled: Boolean(process.env.NEQUI_CLIENT_ID),
            testMode: process.env.NEQUI_API_URL?.includes('sandbox') ?? true,
        },
        mercadopago: {
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
            publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
            webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
            enabled: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
            testMode: process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST') ?? true,
        },
        cobru: {
            apiUrl: process.env.COBRU_API_URL || 'https://api.cobru.co',
            apiKey: process.env.COBRU_API_KEY || '',
            secretKey: process.env.COBRU_SECRET_KEY || '',
            webhookSecret: process.env.COBRU_WEBHOOK_SECRET || '',
            enabled: Boolean(process.env.COBRU_API_KEY),
            testMode: process.env.NODE_ENV !== 'production',
        },
    };
}

/**
 * Get list of enabled payment providers
 */
export function getEnabledProviders(): PaymentProvider[] {
    const config = getPaymentConfig();
    const providers: PaymentProvider[] = [];

    if (config.nequi.enabled) {
        providers.push({
            name: 'nequi',
            enabled: true,
            testMode: config.nequi.testMode,
        });
    }

    if (config.mercadopago.enabled) {
        providers.push({
            name: 'mercadopago',
            enabled: true,
            testMode: config.mercadopago.testMode,
        });
    }

    if (config.cobru.enabled) {
        providers.push({
            name: 'cobru',
            enabled: true,
            testMode: config.cobru.testMode,
        });
    }

    return providers;
}

/**
 * Check if any payment provider is configured
 */
export function hasPaymentProvider(): boolean {
    const config = getPaymentConfig();
    return config.nequi.enabled || config.mercadopago.enabled || config.cobru.enabled;
}

/**
 * Payment Method Types
 */
export type PaymentMethod =
    | 'nequi'
    | 'mercadopago'
    | 'pse'
    | 'credit_card'
    | 'debit_card'
    | 'efecty'
    | 'daviplata'
    | 'baloto';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    nequi: 'Nequi',
    mercadopago: 'MercadoPago',
    pse: 'PSE',
    credit_card: 'Tarjeta de Crédito',
    debit_card: 'Tarjeta Débito',
    efecty: 'Efecty',
    daviplata: 'Daviplata',
    baloto: 'Baloto',
};

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
    nequi: '💜',
    mercadopago: '💙',
    pse: '🏦',
    credit_card: '💳',
    debit_card: '💳',
    efecty: '💵',
    daviplata: '🟢',
    baloto: '🎯',
};
