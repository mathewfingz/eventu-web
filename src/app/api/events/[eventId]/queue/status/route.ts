import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getQueuePosition, verifyAdmission, isQueueActive } from '@/lib/inventory/queue';

/**
 * Get queue status for current session
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const { eventId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const sessionId = user?.id || request.headers.get('x-session-id');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session required' },
                { status: 400 }
            );
        }

        // Check if queue is active
        const queueActive = await isQueueActive(eventId);

        if (!queueActive) {
            return NextResponse.json({
                status: 'admitted',
                message: 'No hay cola activa',
            });
        }

        // Check if already admitted
        const admitted = await verifyAdmission(eventId, sessionId);

        if (admitted) {
            return NextResponse.json({
                status: 'admitted',
                message: 'Es tu turno',
            });
        }

        // Get position
        const entry = await getQueuePosition(eventId, sessionId);

        if (!entry) {
            return NextResponse.json({
                status: 'not_in_queue',
                message: 'No estás en la cola',
            });
        }

        return NextResponse.json({
            status: entry.status,
            position: entry.position,
            estimatedWait: entry.estimatedWait,
            joinedAt: entry.joinedAt,
        });
    } catch (error) {
        console.error('[Queue:Status] Error:', error);
        return NextResponse.json(
            { error: 'Error al obtener estado' },
            { status: 500 }
        );
    }
}
