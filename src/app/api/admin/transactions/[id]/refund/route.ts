import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/transactions/[id]/refund - Process refund for a transaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the payment
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    if (payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Solo se pueden reembolsar transacciones completadas' },
        { status: 400 }
      );
    }

    if (payment.status === 'REFUNDED') {
      return NextResponse.json(
        { error: 'Esta transacción ya fue reembolsada' },
        { status: 400 }
      );
    }

    // Update payment status to REFUNDED
    await prisma.payment.update({
      where: { id },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
      },
    });

    // Update order status if exists
    if (payment.orderId) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'REFUNDED',
        },
      });
    }

    return NextResponse.json({
      message: 'Reembolso procesado correctamente',
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Error al procesar el reembolso' },
      { status: 500 }
    );
  }
}
