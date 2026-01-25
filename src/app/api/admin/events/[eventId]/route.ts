import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/events/[eventId] - Get event details with stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
          },
        },
        promoter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketTypes: {
          select: {
            id: true,
            name: true,
            price: true,
            totalQuantity: true,
            soldQuantity: true,
          },
        },
        orders: {
          where: {
            status: {
              in: ['PAID', 'COMPLETED'],
            },
          },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
            tickets: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Calculate stats
    const totalTickets = event.ticketTypes.reduce(
      (sum: number, t: { totalQuantity: number }) => sum + t.totalQuantity,
      0
    );
    const soldTickets = event.ticketTypes.reduce(
      (sum: number, t: { soldQuantity: number }) => sum + t.soldQuantity,
      0
    );
    const totalRevenue = event.orders.reduce((sum: number, o: { total: number }) => sum + o.total, 0);

    // Get order stats
    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      where: { eventId },
      _count: { id: true },
      _sum: { total: true },
    });

    const stats = {
      totalTickets,
      soldTickets,
      availableTickets: totalTickets - soldTickets,
      soldPercentage:
        totalTickets > 0
          ? Math.round((soldTickets / totalTickets) * 100)
          : 0,
      totalRevenue,
      totalOrders: event._count.orders,
      ordersByStatus: orderStats.reduce(
        (acc, s) => {
          acc[s.status] = { count: s._count.id, total: s._sum.total || 0 };
          return acc;
        },
        {} as Record<string, { count: number; total: number }>
      ),
    };

    return NextResponse.json({
      event: {
        ...event,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Error al obtener el evento' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/events/[eventId] - Update event status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const { status, isFeatured } = body;

    // Check if event exists
    const existing = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      // Validate status transitions
      const validStatuses = [
        'DRAFT',
        'PENDING_APPROVAL',
        'APPROVED',
        'PUBLISHED',
        'SOLD_OUT',
        'CANCELLED',
        'COMPLETED',
      ];

      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Estado inválido' },
          { status: 400 }
        );
      }

      updateData.status = status;

      // Set publishedAt when publishing
      if (status === 'PUBLISHED' && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured;
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el evento' },
      { status: 500 }
    );
  }
}
