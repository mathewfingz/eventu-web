/**
 * Settlement Engine
 * 
 * Calculates organizer payouts with Colombian regulatory deductions:
 * - Platform commission
 * - SAYCO (derechos de autor - composer royalties)
 * - ACINPRO (derechos conexos - performer royalties)
 * - IVA (19% on services)
 * - Withholding tax (retención en la fuente)
 * 
 * Reference: Colombian Law 23 of 1982, Decree 3942 of 2010
 */

import { createClient } from '@/lib/supabase/server';

// Colombian regulatory rates
export const RATES = {
    // Platform fees
    PLATFORM_COMMISSION: 0.10, // 10% of ticket price
    PAYMENT_PROCESSING: 0.029, // ~2.9% payment gateway

    // Author/performer rights (depends on event type)
    SAYCO: {
        CONCIERTO: 0.10, // 10% for concerts
        TEATRO: 0.10, // 10% for theater
        FESTIVAL: 0.08, // 8% for festivals
        DEPORTIVO: 0.00, // No SAYCO for sports
        COMEDIA: 0.10, // 10% for comedy
        OTRO: 0.05, // 5% default
    },
    ACINPRO: {
        CONCIERTO: 0.04, // 4% for concerts
        TEATRO: 0.02, // 2% for theater
        FESTIVAL: 0.04, // 4% for festivals
        DEPORTIVO: 0.00, // No ACINPRO for sports
        COMEDIA: 0.02, // 2% for comedy
        OTRO: 0.02, // 2% default
    },

    // Taxes
    IVA: 0.19, // 19% on services
    WITHHOLDING_TAX: {
        PERSONA_NATURAL: 0.11, // 11% for individuals
        PERSONA_JURIDICA: 0.04, // 4% for companies
        GRAN_CONTRIBUYENTE: 0.025, // 2.5% for large taxpayers
        NO_APLICA: 0.00, // 0% if exempt
    },

    // Municipal tax (depends on city)
    ICA: {
        BOGOTA: 0.00966, // 9.66 per thousand
        MEDELLIN: 0.007, // 7 per thousand
        CALI: 0.0066, // 6.6 per thousand
        BARRANQUILLA: 0.007,
        CARTAGENA: 0.007,
        DEFAULT: 0.007,
    },
};

export type EventType = keyof typeof RATES.SAYCO;
export type TaxpayerType = keyof typeof RATES.WITHHOLDING_TAX;
export type City = keyof typeof RATES.ICA;

export interface OrganizerProfile {
    id: string;
    legalName: string;
    documentType: 'NIT' | 'CC' | 'CE';
    documentNumber: string;
    taxpayerType: TaxpayerType;
    bankName: string;
    bankAccountType: 'AHORROS' | 'CORRIENTE';
    bankAccountNumber: string;
    email: string;
    phone: string;
    address: string;
    city: City;
}

export interface SettlementBreakdown {
    // Gross
    grossRevenue: number; // Total ticket sales
    ticketCount: number;

    // Platform fees
    platformCommission: number;
    platformCommissionIVA: number;
    paymentProcessing: number;

    // Regulatory deductions
    sayco: number;
    acinpro: number;

    // Taxes
    iva: number;
    withholdingTax: number;
    icaTax: number;

    // Totals
    totalDeductions: number;
    netPayout: number;

    // Metadata
    eventType: EventType;
    taxpayerType: TaxpayerType;
    city: City;
    calculatedAt: Date;
}

export interface Settlement {
    id: string;
    eventId: string;
    organizerId: string;
    status: 'PENDING' | 'PROCESSING' | 'PAID' | 'ON_HOLD' | 'DISPUTED';
    breakdown: SettlementBreakdown;
    paymentMethod: 'BANK_TRANSFER' | 'CHECK';
    paymentReference?: string;
    paidAt?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Calculate settlement for an event
 */
export async function calculateSettlement(
    eventId: string,
    organizerProfile: OrganizerProfile
): Promise<SettlementBreakdown | null> {
    try {
        const supabase = await createClient();

        // Get event details
        const { data: event } = await supabase
            .from('events')
            .select(`
        *,
        category:categories(name),
        venue:venues(city)
      `)
            .eq('id', eventId)
            .single();

        if (!event) return null;

        // Get paid orders
        const { data: orders } = await supabase
            .from('orders')
            .select('total_amount, ticket_count, service_fee')
            .eq('event_id', eventId)
            .eq('status', 'PAID');

        if (!orders || orders.length === 0) {
            return null;
        }

        // Calculate gross revenue
        const grossRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const ticketCount = orders.reduce((sum, o) => sum + (o.ticket_count || 1), 0);
        const serviceFees = orders.reduce((sum, o) => sum + (o.service_fee || 0), 0);

        // Determine event type from category
        const eventType = mapCategoryToEventType(event.category?.name || 'Otro');
        const city = (event.venue?.city?.toUpperCase() || 'DEFAULT') as City;

        // Calculate platform fees
        const platformCommission = grossRevenue * RATES.PLATFORM_COMMISSION;
        const platformCommissionIVA = platformCommission * RATES.IVA;
        const paymentProcessing = grossRevenue * RATES.PAYMENT_PROCESSING;

        // Calculate SAYCO/ACINPRO (on gross revenue minus service fees)
        const ticketRevenue = grossRevenue - serviceFees;
        const saycoRate = RATES.SAYCO[eventType] || RATES.SAYCO.OTRO;
        const acinproRate = RATES.ACINPRO[eventType] || RATES.ACINPRO.OTRO;

        const sayco = ticketRevenue * saycoRate;
        const acinpro = ticketRevenue * acinproRate;

        // Calculate taxes
        const withholdingRate = RATES.WITHHOLDING_TAX[organizerProfile.taxpayerType] || RATES.WITHHOLDING_TAX.PERSONA_JURIDICA;
        const icaRate = RATES.ICA[city] || RATES.ICA.DEFAULT;

        // Withholding applies to net payment to organizer
        const preTaxBase = grossRevenue - platformCommission - paymentProcessing - sayco - acinpro;
        const withholdingTax = preTaxBase * withholdingRate;
        const icaTax = preTaxBase * icaRate;

        // IVA on service fees (already collected from buyer)
        const iva = serviceFees * RATES.IVA / (1 + RATES.IVA); // Extract IVA from service fee

        // Calculate totals
        const totalDeductions =
            platformCommission +
            platformCommissionIVA +
            paymentProcessing +
            sayco +
            acinpro +
            withholdingTax +
            icaTax +
            iva;

        const netPayout = grossRevenue - totalDeductions;

        return {
            grossRevenue,
            ticketCount,
            platformCommission,
            platformCommissionIVA,
            paymentProcessing,
            sayco,
            acinpro,
            iva,
            withholdingTax,
            icaTax,
            totalDeductions,
            netPayout,
            eventType,
            taxpayerType: organizerProfile.taxpayerType,
            city,
            calculatedAt: new Date(),
        };
    } catch (error) {
        console.error('[Settlement] Calculation error:', error);
        return null;
    }
}

/**
 * Map category name to event type for SAYCO/ACINPRO rates
 */
function mapCategoryToEventType(category: string): EventType {
    const normalized = category.toLowerCase();

    if (normalized.includes('concierto') || normalized.includes('concert') || normalized.includes('música')) {
        return 'CONCIERTO';
    }
    if (normalized.includes('teatro') || normalized.includes('theater')) {
        return 'TEATRO';
    }
    if (normalized.includes('festival')) {
        return 'FESTIVAL';
    }
    if (normalized.includes('deport') || normalized.includes('sport') || normalized.includes('fútbol')) {
        return 'DEPORTIVO';
    }
    if (normalized.includes('comedia') || normalized.includes('comedy') || normalized.includes('stand')) {
        return 'COMEDIA';
    }

    return 'OTRO';
}

/**
 * Create settlement record
 */
export async function createSettlement(
    eventId: string,
    organizerId: string,
    breakdown: SettlementBreakdown
): Promise<Settlement | null> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('settlements')
            .insert({
                event_id: eventId,
                organizer_id: organizerId,
                status: 'PENDING',
                breakdown,
                payment_method: 'BANK_TRANSFER',
            })
            .select()
            .single();

        if (error) {
            console.error('[Settlement] Create error:', error);
            return null;
        }

        return {
            id: data.id,
            eventId: data.event_id,
            organizerId: data.organizer_id,
            status: data.status,
            breakdown: data.breakdown,
            paymentMethod: data.payment_method,
            paymentReference: data.payment_reference,
            paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
            notes: data.notes,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    } catch (error) {
        console.error('[Settlement] Create failed:', error);
        return null;
    }
}

/**
 * Process settlement payout
 */
export async function processSettlementPayout(
    settlementId: string,
    paymentReference: string
): Promise<boolean> {
    try {
        const supabase = await createClient();

        await supabase
            .from('settlements')
            .update({
                status: 'PAID',
                payment_reference: paymentReference,
                paid_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', settlementId);

        // Create audit log
        await supabase
            .from('audit_logs')
            .insert({
                entity_type: 'SETTLEMENT',
                entity_id: settlementId,
                action: 'PAYOUT_PROCESSED',
                data: { paymentReference },
            });

        console.log(`[Settlement] Payout processed: ${settlementId}`);
        return true;
    } catch (error) {
        console.error('[Settlement] Payout failed:', error);
        return false;
    }
}

/**
 * Get organizer settlements
 */
export async function getOrganizerSettlements(organizerId: string): Promise<Settlement[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('settlements')
            .select(`
        *,
        event:events(name, date)
      `)
            .eq('organizer_id', organizerId)
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map(s => ({
            id: s.id,
            eventId: s.event_id,
            organizerId: s.organizer_id,
            status: s.status,
            breakdown: s.breakdown,
            paymentMethod: s.payment_method,
            paymentReference: s.payment_reference,
            paidAt: s.paid_at ? new Date(s.paid_at) : undefined,
            notes: s.notes,
            createdAt: new Date(s.created_at),
            updatedAt: new Date(s.updated_at),
        }));
    } catch (error) {
        console.error('[Settlement] Get organizer settlements failed:', error);
        return [];
    }
}
