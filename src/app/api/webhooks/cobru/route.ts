import { NextRequest, NextResponse } from 'next/server';
import { verifyCobruWebhook } from '@/lib/payments/cobru';
import { createClient } from '@/lib/supabase/server';

/**
 * Cobru Webhook Handler
 * 
 * Receives payment confirmations for PSE, Efecty, Daviplata, Baloto
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-cobru-signature') || '';
        const timestamp = request.headers.get('x-cobru-timestamp') || '';

        // Verify webhook signature (skip in dev if not configured)
        const isValid = verifyCobruWebhook(body, signature, timestamp);

        if (!isValid && process.env.NODE_ENV === 'production') {
            console.error('[Webhook:Cobru] Invalid signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        const payload = JSON.parse(body);

        console.log('[Webhook:Cobru] Received:', payload);

        const {
            payment_id,
            reference: orderId,
            status,
            payment_method,
            amount,
            paid_at,
        } = payload;

        // Map Cobru status
        let orderStatus = 'PENDING';
        switch (status) {
            case 'APPROVED':
            case 'COMPLETED':
                orderStatus = 'PAID';
                break;
            case 'REJECTED':
            case 'FAILED':
                orderStatus = 'CANCELLED';
                break;
            case 'CANCELLED':
                orderStatus = 'CANCELLED';
                break;
            case 'EXPIRED':
                orderStatus = 'EXPIRED';
                break;
            case 'PENDING':
            case 'PROCESSING':
                orderStatus = 'PROCESSING';
                break;
        }

        // Update order in database
        const supabase = await createClient();

        const { error } = await supabase
            .from('orders')
            .update({
                status: orderStatus,
                payment_id,
                payment_method,
                paid_at: orderStatus === 'PAID' ? (paid_at || new Date().toISOString()) : null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        if (error) {
            console.error('[Webhook:Cobru] Database update failed:', error);
        }

        // If payment successful, activate tickets
        if (orderStatus === 'PAID') {
            await supabase
                .from('tickets')
                .update({
                    status: 'ACTIVE',
                    updated_at: new Date().toISOString(),
                })
                .eq('order_id', orderId);

            // TODO: Send confirmation email
            // TODO: Generate SafeTix secrets
        }

        return NextResponse.json({
            received: true,
            orderId,
            status: orderStatus
        });
    } catch (error) {
        console.error('[Webhook:Cobru] Error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Acknowledge GET requests for webhook validation
export async function GET() {
    return NextResponse.json({ status: 'ok', provider: 'cobru' });
}
