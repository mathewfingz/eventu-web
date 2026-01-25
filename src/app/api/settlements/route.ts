/**
 * Settlement API
 * 
 * API routes for settlement operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    calculateSettlement,
    createSettlement,
    getOrganizerSettlements,
    generateSettlementReportPDF,
    pdfToHTML,
    logAudit,
} from '@/lib/settlement';

/**
 * GET /api/settlements
 * Get organizer's settlements
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get organizer profile
        const { data: profile } = await supabase
            .from('organizer_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json(
                { success: false, error: 'No organizer profile found' },
                { status: 403 }
            );
        }

        const settlements = await getOrganizerSettlements(user.id);

        // Log access
        await logAudit('SETTLEMENT', 'LIST', 'VIEW', {
            userId: user.id,
            data: { count: settlements.length },
        });

        return NextResponse.json({
            success: true,
            data: {
                settlements,
                summary: {
                    total: settlements.length,
                    pending: settlements.filter(s => s.status === 'PENDING').length,
                    paid: settlements.filter(s => s.status === 'PAID').length,
                    totalPaid: settlements
                        .filter(s => s.status === 'PAID')
                        .reduce((sum, s) => sum + s.breakdown.netPayout, 0),
                    totalPending: settlements
                        .filter(s => s.status === 'PENDING')
                        .reduce((sum, s) => sum + s.breakdown.netPayout, 0),
                },
            },
        });
    } catch (error) {
        console.error('[Settlements API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/settlements
 * Create settlement for an event
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { eventId } = body;

        if (!eventId) {
            return NextResponse.json(
                { success: false, error: 'eventId required' },
                { status: 400 }
            );
        }

        // Verify user owns this event
        const { data: event } = await supabase
            .from('events')
            .select('organizer_id')
            .eq('id', eventId)
            .single();

        if (!event || event.organizer_id !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Get organizer profile
        const { data: profile } = await supabase
            .from('organizer_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json(
                { success: false, error: 'Complete your organizer profile first' },
                { status: 400 }
            );
        }

        // Calculate settlement
        const breakdown = await calculateSettlement(eventId, {
            id: profile.id,
            legalName: profile.legal_name,
            documentType: profile.document_type,
            documentNumber: profile.document_number,
            taxpayerType: profile.taxpayer_type,
            bankName: profile.bank_name,
            bankAccountType: profile.bank_account_type,
            bankAccountNumber: profile.bank_account_number,
            email: profile.email,
            phone: profile.phone,
            address: profile.address,
            city: profile.city,
        });

        if (!breakdown) {
            return NextResponse.json(
                { success: false, error: 'No sales found for this event' },
                { status: 400 }
            );
        }

        // Create settlement
        const settlement = await createSettlement(eventId, user.id, breakdown);

        if (!settlement) {
            return NextResponse.json(
                { success: false, error: 'Failed to create settlement' },
                { status: 500 }
            );
        }

        // Log creation
        await logAudit('SETTLEMENT', settlement.id, 'CREATE', {
            userId: user.id,
            data: {
                eventId,
                grossRevenue: breakdown.grossRevenue,
                netPayout: breakdown.netPayout,
            },
        });

        return NextResponse.json({
            success: true,
            data: settlement,
        });
    } catch (error) {
        console.error('[Settlements API] Create error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}
