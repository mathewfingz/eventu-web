import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/transactions - Get all transactions (orders) with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

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

    if (method) {
      where.paymentMethod = method;
    }

    // Get orders acting as transactions
    const [orders, total] = await Promise.all([
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
    ]);

    // Transform data for frontend
    const formattedTransactions = orders.map((order) => {
      return {
        id: order.id,
        orderId: order.orderNumber,
        eventName: order.event?.name || 'Evento desconocido',
        eventDate: order.event?.date?.toISOString(),
        venueName: order.event?.venue?.name,
        customerName: order.user?.name || 'Cliente desconocido',
        customerEmail: order.user?.email || '',
        amount: order.total,
        fee: order.feesTotal,
        netAmount: order.subtotal,
        subtotal: order.subtotal,
        taxesTotal: order.taxesTotal,
        method: order.paymentMethod,
        paymentId: order.paymentId,
        status: order.status,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: order.items.map((item: any) => ({
          name: item.ticketType?.name || 'Ticket',
          quantity: item.quantity,
          unitPrice: item.ticketType?.price || 0,
        })),
      };
    });

    return NextResponse.json({
      transactions: formattedTransactions,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Error al obtener las transacciones' },
      { status: 500 }
    );
  }
}
