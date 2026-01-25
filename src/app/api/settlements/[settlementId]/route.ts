/**
 * Settlement Detail API
 * 
 * Get individual settlement and download report
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    generateSettlementReportPDF,
    pdfToHTML,
    logAudit,
} from '@/lib/settlement';

/**
 * GET /api/settlements/[settlementId]
 * Get settlement details
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ settlementId: string }> }
) {
    try {
        const { settlementId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get settlement with event and organizer info
        const { data: settlement } = await supabase
            .from('settlements')
            .select(`
        *,
        event:events(name, date),
        organizer:profiles(full_name, email)
      `)
            .eq('id', settlementId)
            .single();

        if (!settlement) {
            return NextResponse.json(
                { success: false, error: 'Settlement not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (settlement.organizer_id !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Check if PDF format requested
        const format = request.nextUrl.searchParams.get('format');

        if (format === 'html') {
            // Get organizer profile for PDF
            const { data: profile } = await supabase
                .from('organizer_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (profile) {
                const pdfStructure = generateSettlementReportPDF(
                    {
                        id: settlement.id,
                        eventId: settlement.event_id,
                        organizerId: settlement.organizer_id,
                        status: settlement.status,
                        breakdown: settlement.breakdown,
                        paymentMethod: settlement.payment_method,
                        paymentReference: settlement.payment_reference,
                        paidAt: settlement.paid_at ? new Date(settlement.paid_at) : undefined,
                        notes: settlement.notes,
                        createdAt: new Date(settlement.created_at),
                        updatedAt: new Date(settlement.updated_at),
                    },
                    {
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
                    },
                    settlement.event?.name || 'Evento',
                    new Date(settlement.event?.date || Date.now())
                );

                const html = pdfToHTML(pdfStructure);

                // Log export
                await logAudit('SETTLEMENT', settlement.id, 'EXPORT', {
                    userId: user.id,
                    data: { format: 'html' },
                });

                return new NextResponse(html, {
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8',
                    },
                });
            }
        }

        // Log view
        await logAudit('SETTLEMENT', settlement.id, 'VIEW', {
            userId: user.id,
        });

        return NextResponse.json({
            success: true,
            data: {
                id: settlement.id,
                eventId: settlement.event_id,
                eventName: settlement.event?.name,
                eventDate: settlement.event?.date,
                status: settlement.status,
                breakdown: settlement.breakdown,
                paymentMethod: settlement.payment_method,
                paymentReference: settlement.payment_reference,
                paidAt: settlement.paid_at,
                notes: settlement.notes,
                createdAt: settlement.created_at,
                updatedAt: settlement.updated_at,
            },
        });
    } catch (error) {
        console.error('[Settlement API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}
