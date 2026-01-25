/**
 * Event Analytics API
 * 
 * Detailed analytics for event organizers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getEventAnalytics, getOrganizerAnalytics } from '@/lib/analytics/engine';
import { predictDemand, getDemandInsights } from '@/lib/ai/demand-prediction';

/**
 * GET /api/analytics/event/[eventId]
 * Get comprehensive analytics for an event
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const { eventId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify user is organizer of this event
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

        // Get analytics
        const analytics = await getEventAnalytics(eventId);

        if (!analytics) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        // Get demand prediction
        const demandPrediction = await predictDemand(eventId);
        const demandInsights = await getDemandInsights(eventId);

        return NextResponse.json({
            success: true,
            data: {
                ...analytics,
                prediction: demandPrediction,
                insights: demandInsights,
            },
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error('[Analytics API] Event error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}
