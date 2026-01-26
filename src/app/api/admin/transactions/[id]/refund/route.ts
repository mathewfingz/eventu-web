import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/admin/transactions/[id]/refund - Process refund for a transaction (order)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    if (order.status === 'REFUNDED') {
      return NextResponse.json(
        { error: 'Esta transacción ya fue reembolsada' },
        { status: 400 }
      );
    }

    if (order.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Solo se pueden reembolsar transacciones completadas' },
        { status: 400 }
      );
    }

    // Update order status to REFUNDED
    await prisma.order.update({
      where: { id },
      data: {
        status: 'REFUNDED',
        // In a real system we would record refund metadata or create a refund record
      },
    });

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
