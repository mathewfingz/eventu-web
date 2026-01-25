import { NextRequest, NextResponse } from 'next/server';
import { verifyNequiWebhook } from '@/lib/payments/nequi';
import { createClient } from '@/lib/supabase/server';

/**
 * Nequi Webhook Handler
 * 
 * Receives payment confirmations from Nequi
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-nequi-signature') || '';

        // Verify webhook signature (skip in dev if not configured)
        const isValid = verifyNequiWebhook(body, signature);

        if (!isValid && process.env.NODE_ENV === 'production') {
            console.error('[Webhook:Nequi] Invalid signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        const payload = JSON.parse(body);

        console.log('[Webhook:Nequi] Received:', payload);

        // Extract payment info
        const data = payload.ResponseMessage?.ResponseBody?.any?.notifyPaymentRS;

        if (!data) {
            return NextResponse.json({ received: true });
        }

        const orderId = data.code;
        const status = data.status;
        const transactionId = data.transactionId;

        // Map Nequi status
        let orderStatus = 'PENDING';
        if (status === '35') orderStatus = 'PAID';
        else if (status === '36') orderStatus = 'CANCELLED';
        else if (status === '37') orderStatus = 'EXPIRED';

        // Update order in database
        const supabase = await createClient();

        const { error } = await supabase
            .from('orders')
            .update({
                status: orderStatus,
                payment_id: transactionId,
                paid_at: orderStatus === 'PAID' ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        if (error) {
            console.error('[Webhook:Nequi] Database update failed:', error);
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
        }

        return NextResponse.json({ received: true, orderId, status: orderStatus });
    } catch (error) {
        console.error('[Webhook:Nequi] Error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Acknowledge GET requests for webhook validation
export async function GET() {
    return NextResponse.json({ status: 'ok', provider: 'nequi' });
}
