/**
 * Analytics API Routes
 * 
 * RESTful APIs designed for consumption by web and iOS apps.
 * All responses follow a consistent format for mobile parsing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackEvent } from '@/lib/analytics/engine';

export const dynamic = 'force-dynamic';

/**
 * POST /api/analytics/track
 * Track an analytics event (works for web and mobile)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            type,
            sessionId,
            eventId,
            ticketTypeId,
            orderId,
            metadata,
            platform = 'web',
            appVersion,
        } = body;

        if (!type || !sessionId) {
            return NextResponse.json(
                { success: false, error: 'type and sessionId required' },
                { status: 400 }
            );
        }

        // Get user if authenticated
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const success = await trackEvent({
            type,
            userId: user?.id,
            sessionId,
            eventId,
            ticketTypeId,
            orderId,
            metadata,
            platform,
            appVersion,
        });

        return NextResponse.json({ success });
    } catch (error) {
        console.error('[Analytics API] Track error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}
