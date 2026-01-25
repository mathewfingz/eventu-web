import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/orders/[orderId] - Get a single order with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            venue: {
              select: {
                name: true,
                address: true,
                city: true,
              },
            },
          },
        },
        items: {
          include: {
            ticketType: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Error al obtener la orden' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders/[orderId] - Update order (mainly for refunds)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { action, itemIds } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    if (action === 'refund') {
      // Full refund
      if (order.status === 'REFUNDED') {
        return NextResponse.json(
          { error: 'Esta orden ya fue reembolsada' },
          { status: 400 }
        );
      }

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'REFUNDED',
        },
      });

      // Update payment status if exists
      if (order.payments.length > 0) {
        await prisma.payment.updateMany({
          where: { orderId },
          data: {
            status: 'REFUNDED',
            refundedAt: new Date(),
          },
        });
      }

      return NextResponse.json({
        message: 'Orden reembolsada correctamente',
      });
    }

    if (action === 'partial_refund' && itemIds?.length > 0) {
      // Partial refund - mark specific items as refunded
      // This would need more complex logic in a real implementation
      return NextResponse.json({
        message: 'Reembolso parcial no implementado aún',
      });
    }

    if (action === 'cancel') {
      if (order.status === 'CANCELLED') {
        return NextResponse.json(
          { error: 'Esta orden ya fue cancelada' },
          { status: 400 }
        );
      }

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
        },
      });

      return NextResponse.json({
        message: 'Orden cancelada correctamente',
      });
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la orden' },
      { status: 500 }
    );
  }
}
