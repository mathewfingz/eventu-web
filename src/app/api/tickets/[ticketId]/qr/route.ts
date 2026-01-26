import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {

    generateTicketSecret,
    generateDynamicCode,
    preGenerateOfflineCodes
} from '@/lib/safetix/totp';

/**
 * Generate SafeTix QR code for a ticket
 * 
 * Returns the current TOTP code and optionally pre-generated offline codes
 */
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ ticketId: string }> }
) {
    try {
        const { ticketId } = await params;

        // Get authenticated user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get ticket from database
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .select('*, order:orders(*)')
            .eq('id', ticketId)
            .single();

        if (ticketError || !ticket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (ticket.order?.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        // Check ticket status
        if (ticket.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'Ticket not active', status: ticket.status },
                { status: 400 }
            );
        }

        // Get or generate SafeTix secret
        let secret = ticket.safetix_secret;

        if (!secret) {
            // Generate new secret for this ticket
            secret = generateTicketSecret();

            // Save to database
            await supabase
                .from('tickets')
                .update({ safetix_secret: secret })
                .eq('id', ticketId);
        }

        // Generate current TOTP code
        const code = generateDynamicCode(secret);

        // Check if offline codes requested
        const includeOffline = request.nextUrl.searchParams.get('offline') === 'true';

        let offlineCodes: { code: string; validUntil: number }[] = [];

        if (includeOffline) {
            // Pre-generate 24 hours of codes
            const rawCodes = preGenerateOfflineCodes(secret, 24);
            offlineCodes = rawCodes.map((c, index) => ({
                code: c.code,
                validUntil: c.timestamp + (15 * 1000), // Valid for 15 seconds after timestamp
            }));
        }

        return NextResponse.json({
            code,
            ticketId,
            expiresIn: 15, // seconds
            offlineCodes: includeOffline ? offlineCodes : undefined,
        });
    } catch (error) {
        console.error('[SafeTix] Error generating code:', error);
        return NextResponse.json(
            { error: 'Failed to generate code' },
            { status: 500 }
        );
    }
}
