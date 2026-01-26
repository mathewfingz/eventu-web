import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/orders - Get all orders with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const eventId = searchParams.get('eventId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { event: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
      }
    }

    // Get orders with related data
    const [orders, total, stats] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
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

        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
      // Get stats
      prisma.order.aggregate({
        where,
        _sum: {
          total: true,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    // Get additional stats
    const [pendingCount, refundedCount] = await Promise.all([
      prisma.order.count({ where: { ...where, status: 'PENDING' } }),
      prisma.order.count({ where: { ...where, status: 'REFUNDED' } }),
    ]);

    // Transform data for frontend
    const formattedOrders = orders.map((order) => {
      // const payment = order.payments[0];

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || 'Cliente desconocido',
        customerEmail: order.user?.email || '',
        eventName: order.event?.name || 'Evento desconocido',
        eventDate: order.event?.date?.toISOString(),
        venueName: order.event?.venue?.name,
        total: order.total,
        subtotal: order.subtotal,
        fees: order.feesTotal || 0,
        taxes: order.taxesTotal || 0,
        status: order.status,
        paymentMethod: order.paymentMethod || null,
        paymentStatus: order.status || null,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        ticketCount: order.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
        items: order.items.map((item: { id: string; quantity: number; ticketType: { name: string; price: number } | null }) => ({
          id: item.id,
          name: item.ticketType?.name || 'Ticket',
          quantity: item.quantity,
          unitPrice: item.ticketType?.price || 0,
          total: (item.ticketType?.price || 0) * item.quantity,
        })),
      };
    });

    return NextResponse.json({
      orders: formattedOrders,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
      stats: {
        totalOrders: stats._count._all,
        totalRevenue: stats._sum.total || 0,
        pendingOrders: pendingCount,
        refundedOrders: refundedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Error al obtener las órdenes' },
      { status: 500 }
    );
  }
}
