import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { joinQueue, getQueuePosition, isQueueActive } from '@/lib/inventory/queue';

export const dynamic = 'force-dynamic';

/**
 * Join virtual queue for an event
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const { eventId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Generate session ID for anonymous users
        const sessionId = user?.id || request.headers.get('x-session-id') || crypto.randomUUID();
        const userId = user?.id || 'anonymous';

        // Check if queue is active
        const queueActive = await isQueueActive(eventId);

        if (!queueActive) {
            // No queue needed, direct access
            return NextResponse.json({
                status: 'admitted',
                message: 'No hay cola activa, puedes comprar directamente',
            });
        }

        // Join the queue
        const entry = await joinQueue(eventId, userId, sessionId);

        if (!entry) {
            return NextResponse.json(
                { error: 'No se pudo unir a la cola' },
                { status: 500 }
            );
        }

        if (entry.status === 'admitted') {
            return NextResponse.json({
                status: 'admitted',
                message: 'Es tu turno',
            });
        }

        return NextResponse.json({
            status: 'waiting',
            position: entry.position,
            estimatedWait: entry.estimatedWait,
            joinedAt: entry.joinedAt,
        });
    } catch (error) {
        console.error('[Queue:Join] Error:', error);
        return NextResponse.json(
            { error: 'Error al unirse a la cola' },
            { status: 500 }
        );
    }
}
