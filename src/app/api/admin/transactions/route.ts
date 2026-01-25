import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/transactions - Get all transactions with filters
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
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
        { order: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { order: { user: { email: { contains: search, mode: 'insensitive' } } } },
        { order: { event: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (method) {
      where.paymentMethod = method;
    }

    // Get transactions with related data
    const [transactions, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
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
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    // Transform data for frontend
    const formattedTransactions = transactions.map((txn) => {
      const subtotal = txn.order?.items?.reduce(
        (sum, item) => sum + (item.ticketType?.price || 0) * item.quantity,
        0
      ) || 0;

      return {
        id: txn.id,
        orderId: txn.order?.orderNumber || txn.orderId,
        eventName: txn.order?.event?.name || 'Evento desconocido',
        eventDate: txn.order?.event?.date?.toISOString(),
        venueName: txn.order?.event?.venue?.name,
        customerName: txn.order?.user?.name || 'Cliente desconocido',
        customerEmail: txn.order?.user?.email || '',
        amount: txn.amount,
        fee: txn.platformFee || 0,
        netAmount: txn.amount - (txn.platformFee || 0),
        subtotal,
        taxesTotal: txn.taxAmount || 0,
        method: txn.paymentMethod,
        paymentId: txn.externalId,
        status: txn.status,
        createdAt: txn.createdAt,
        paidAt: txn.paidAt,
        items: txn.order?.items?.map((item) => ({
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
