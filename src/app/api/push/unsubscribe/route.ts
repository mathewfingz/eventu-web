/**
 * Push Notification Unsubscribe API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/push/unsubscribe
 * Unsubscribe from push notifications
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

        const { endpoint } = await request.json();

        if (!endpoint) {
            return NextResponse.json(
                { success: false, error: 'Endpoint required' },
                { status: 400 }
            );
        }

        // Delete subscription
        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', endpoint)
            .eq('user_id', user.id);

        if (error) {
            console.error('[Push] Unsubscribe failed:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to unsubscribe' },
                { status: 500 }
            );
        }

        console.log('[Push] User unsubscribed:', user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Push] Unsubscribe error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}
