import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/users/[userId]/orders - Get user order history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get user with stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            orders: true,
            tickets: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Get orders with details
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            venue: {
              select: {
                name: true,
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
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const totalSpent = orders
      .filter((o) => o.status === 'PAID')
      .reduce((sum, o) => sum + o.total, 0);

    const uniqueEvents = new Set(orders.map((o) => o.eventId)).size;

    return NextResponse.json({
      user: {
        ...user,
        totalOrders: user._count.orders,
        totalTickets: user._count.tickets,
        totalSpent,
        eventsAttended: uniqueEvents,
      },
      orders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Error al obtener las órdenes del usuario' },
      { status: 500 }
    );
  }
}
