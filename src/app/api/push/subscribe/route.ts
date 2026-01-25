/**
 * Push Notification API Routes
 * 
 * Subscribe and unsubscribe from push notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/push/subscribe
 * Subscribe to push notifications
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

        const subscription = await request.json();

        if (!subscription.endpoint || !subscription.keys) {
            return NextResponse.json(
                { success: false, error: 'Invalid subscription data' },
                { status: 400 }
            );
        }

        // Store subscription in database
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                user_agent: request.headers.get('user-agent'),
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'endpoint',
            });

        if (error) {
            console.error('[Push] Subscription save failed:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to save subscription' },
                { status: 500 }
            );
        }

        console.log('[Push] User subscribed:', user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Push] Subscribe error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}
