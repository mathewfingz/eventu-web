import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyCoordinatorAccess } from '@/lib/coordinator-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { eventId } = await params;

    // Verify coordinator access with canViewOrders permission
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canViewOrders');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para ver las ventas' },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const securityValidation = searchParams.get('securityValidation'); // 'pending', 'approved', 'rejected'

    // Build where clause
    const where: any = { eventId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Security validation filter (based on order metadata or custom field)
    // This assumes we have a securityStatus field or similar
    if (securityValidation === 'pending') {
      where.status = 'PAID';
      // Filter orders that need security validation
    }

    // Get total count
    const total = await prisma.order.count({ where });

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            ticketType: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        tickets: {
          select: {
            id: true,
            status: true,
            seatRow: true,
            seatNumber: true,
            section: true,
            usedAt: true
          }
        },
        presale: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Format orders
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customer: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone
      },
      items: order.items.map(item => ({
        ticketType: item.ticketType.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      tickets: order.tickets.map(ticket => ({
        id: ticket.id,
        status: ticket.status,
        seat: ticket.seatRow && ticket.seatNumber
          ? `${ticket.section || ''} - Fila ${ticket.seatRow}, Asiento ${ticket.seatNumber}`
          : 'General',
        usedAt: ticket.usedAt?.toISOString() || null
      })),
      subtotal: order.subtotal,
      feesTotal: order.feesTotal,
      taxesTotal: order.taxesTotal,
      discountTotal: order.discountTotal,
      total: order.total,
      paymentMethod: order.paymentMethod,
      presale: order.presale ? {
        id: order.presale.id,
        name: order.presale.name,
        type: order.presale.type
      } : null,
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString() || null
    }));

    // Get summary stats
    const stats = await prisma.order.groupBy({
      by: ['status'],
      where: { eventId },
      _count: true,
      _sum: { total: true }
    });

    const summary = {
      totalOrders: total,
      totalRevenue: stats.filter(s => s.status === 'PAID').reduce((sum, s) => sum + (s._sum.total || 0), 0),
      pendingOrders: stats.find(s => s.status === 'PENDING')?._count || 0,
      paidOrders: stats.find(s => s.status === 'PAID')?._count || 0,
      cancelledOrders: stats.find(s => s.status === 'CANCELLED')?._count || 0,
      refundedOrders: stats.find(s => s.status === 'REFUNDED')?._count || 0
    };

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
