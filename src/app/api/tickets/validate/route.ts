import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateDynamicCode } from '@/lib/safetix/totp';

export const dynamic = 'force-dynamic';

/**
 * SafeTix Validation API
 * 
 * Used by coordinators to validate tickets at entry
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ticketId, code, deviceId } = body;

        if (!ticketId || !code) {
            return NextResponse.json(
                { valid: false, error: 'Missing ticketId or code' },
                { status: 400 }
            );
        }

        // Get authenticated coordinator
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { valid: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check user role (must be COORDINATOR or SUPERADMIN)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['admin', 'organizer'].includes(profile.role)) {
            return NextResponse.json(
                { valid: false, error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // Get ticket from database
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .select(`
        *,
        ticket_type:ticket_types(
          *,
          event:events(*)
        )
      `)
            .eq('id', ticketId)
            .single();

        if (ticketError || !ticket) {
            return NextResponse.json({
                valid: false,
                error: 'Ticket not found',
                errorCode: 'TICKET_NOT_FOUND',
            });
        }

        // Check ticket status
        if (ticket.status === 'USED') {
            return NextResponse.json({
                valid: false,
                error: 'Boleta ya utilizada',
                errorCode: 'ALREADY_USED',
                usedAt: ticket.used_at,
            });
        }

        if (ticket.status === 'CANCELLED') {
            return NextResponse.json({
                valid: false,
                error: 'Boleta cancelada',
                errorCode: 'CANCELLED',
            });
        }

        if (ticket.status !== 'ACTIVE') {
            return NextResponse.json({
                valid: false,
                error: 'Boleta inválida',
                errorCode: 'INVALID_STATUS',
                status: ticket.status,
            });
        }

        // Validate TOTP code
        const secret = ticket.safetix_secret;

        if (!secret) {
            return NextResponse.json({
                valid: false,
                error: 'Ticket security not configured',
                errorCode: 'NO_SECRET',
            });
        }

        const isValidCode = validateDynamicCode(secret, code);

        if (!isValidCode) {
            return NextResponse.json({
                valid: false,
                error: 'Código inválido o expirado',
                errorCode: 'INVALID_CODE',
            });
        }

        // Mark ticket as used
        const now = new Date().toISOString();

        await supabase
            .from('tickets')
            .update({
                status: 'USED',
                used_at: now,
                used_by_device: deviceId || 'unknown',
                updated_at: now,
            })
            .eq('id', ticketId);

        // Log validation event
        await supabase
            .from('audit_logs')
            .insert({
                entity_type: 'TICKET',
                entity_id: ticketId,
                action: 'validate',
                performed_by_id: user.id,
                performed_by_type: 'coordinator',
                performed_by_device: deviceId,
                metadata: {
                    eventId: ticket.ticket_type?.event?.id,
                    eventName: ticket.ticket_type?.event?.name,
                    ticketType: ticket.ticket_type?.name,
                },
            });

        // Return success with ticket info
        return NextResponse.json({
            valid: true,
            ticket: {
                id: ticketId,
                type: ticket.ticket_type?.name,
                section: ticket.section,
                seatRow: ticket.seat_row,
                seatNumber: ticket.seat_number,
                event: ticket.ticket_type?.event?.name,
            },
            validatedAt: now,
        });
    } catch (error) {
        console.error('[SafeTix:Validate] Error:', error);
        return NextResponse.json(
            { valid: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
