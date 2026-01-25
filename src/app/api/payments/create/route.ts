import { NextRequest, NextResponse } from 'next/server';
import { createPayment, SupportedPaymentMethod } from '@/lib/payments';
import { createClient } from '@/lib/supabase/server';

/**
 * Create Payment API
 * 
 * Creates a payment intent with the selected provider
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, amount, method, email } = body;

        if (!orderId || !amount || !method) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_REQUEST', message: 'Faltan parámetros' } },
                { status: 400 }
            );
        }

        // Get user from session
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const customerEmail = email || user?.email || 'guest@eventu.co';

        // Create payment with selected provider
        const result = await createPayment(
            {
                orderId,
                amount,
                method,
                customerEmail,
                description: `Boletas Eventu - Orden ${orderId}`,
                successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${orderId}`,
                failureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure?order=${orderId}`,
            },
            method as SupportedPaymentMethod
        );

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }

        // Update order with payment intent info
        await supabase
            .from('orders')
            .update({
                payment_method: method,
                payment_id: result.paymentIntent?.id,
                status: 'PROCESSING',
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        return NextResponse.json({
            success: true,
            paymentIntent: result.paymentIntent,
        });
    } catch (error) {
        console.error('[API:Payments] Error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'SERVER_ERROR', message: 'Error interno' } },
            { status: 500 }
        );
    }
}
