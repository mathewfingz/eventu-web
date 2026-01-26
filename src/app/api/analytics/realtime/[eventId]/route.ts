/**
 * Real-time Analytics API
 * 
 * API for iOS widgets and live dashboards
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRealTimeStats, recordHeartbeat } from '@/lib/analytics/realtime';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/realtime/[eventId]
 * Get real-time stats for iOS widget and dashboard
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const { eventId } = await params;
        const stats = await getRealTimeStats(eventId);

        return NextResponse.json({
            success: true,
            data: stats,
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error('[RealTime API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/analytics/realtime/[eventId]
 * Record heartbeat from client
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const { eventId } = await params;
        const body = await request.json();
        const { sessionId, location = 'browsing' } = body;

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'sessionId required' },
                { status: 400 }
            );
        }

        await recordHeartbeat(eventId, sessionId, location);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[RealTime API] Heartbeat error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}
