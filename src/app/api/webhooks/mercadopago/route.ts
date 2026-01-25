import { NextRequest, NextResponse } from 'next/server';
import { verifyMercadoPagoWebhook, getMercadoPagoPayment } from '@/lib/payments/mercadopago';
import { createClient } from '@/lib/supabase/server';

/**
 * MercadoPago Webhook Handler
 * 
 * Receives payment notifications from MercadoPago
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const xSignature = request.headers.get('x-signature') || '';
        const xRequestId = request.headers.get('x-request-id') || '';

        const payload = JSON.parse(body);

        console.log('[Webhook:MercadoPago] Received:', payload);

        // Only process payment notifications
        if (payload.type !== 'payment') {
            return NextResponse.json({ received: true, ignored: true });
        }

        const dataId = payload.data?.id?.toString() || '';

        // Verify webhook signature (skip in dev if not configured)
        const isValid = verifyMercadoPagoWebhook(xSignature, xRequestId, dataId);

        if (!isValid && process.env.NODE_ENV === 'production') {
            console.error('[Webhook:MercadoPago] Invalid signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Get full payment details
        const paymentResult = await getMercadoPagoPayment(dataId);

        if (!paymentResult.success || !paymentResult.paymentIntent) {
            console.error('[Webhook:MercadoPago] Could not get payment details');
            return NextResponse.json({ received: true, error: 'Payment not found' });
        }

        const { paymentIntent } = paymentResult;
        const orderId = paymentIntent.orderId;

        // Map status
        let orderStatus = 'PENDING';
        switch (paymentIntent.status) {
            case 'approved':
                orderStatus = 'PAID';
                break;
            case 'rejected':
                orderStatus = 'CANCELLED';
                break;
            case 'refunded':
                orderStatus = 'REFUNDED';
                break;
            case 'processing':
                orderStatus = 'PROCESSING';
                break;
        }

        // Update order in database
        const supabase = await createClient();

        const { error } = await supabase
            .from('orders')
            .update({
                status: orderStatus,
                payment_id: dataId,
                payment_method: paymentIntent.method,
                paid_at: orderStatus === 'PAID' ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        if (error) {
            console.error('[Webhook:MercadoPago] Database update failed:', error);
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
        console.error('[Webhook:MercadoPago] Error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Acknowledge GET requests for webhook validation
export async function GET() {
    return NextResponse.json({ status: 'ok', provider: 'mercadopago' });
}
