import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyCoordinatorAccess } from '@/lib/coordinator-auth';

export const dynamic = 'force-dynamic';

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

    // Verify coordinator access
    const access = await verifyCoordinatorAccess(session.user.id, eventId);
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes acceso a este evento' },
        { status: 403 }
      );
    }

    // Fetch event with all related data
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venue: true,
        ticketTypes: true,
        presales: {
          include: {
            codes: true
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Get validation stats
    const validatedTickets = await prisma.ticket.count({
      where: {
        order: { eventId },
        status: 'USED'
      }
    });

    // Get orders stats
    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      where: { eventId },
      _count: true,
      _sum: {
        total: true
      }
    });

    const totalRevenue = orderStats
      .filter(s => s.status === 'PAID')
      .reduce((sum, s) => sum + (s._sum.total || 0), 0);

    const pendingOrders = orderStats
      .filter(s => s.status === 'PENDING')
      .reduce((sum, s) => sum + s._count, 0);

    return NextResponse.json({
      event: {
        ...event,
        date: event.date.toISOString(),
        doorsOpenAt: event.doorsOpenAt?.toISOString() || null,
        endsAt: event.endsAt?.toISOString() || null,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        publishedAt: event.publishedAt?.toISOString() || null
      },
      stats: {
        totalCapacity: event.ticketTypes.reduce((sum, tt) => sum + tt.totalQuantity, 0),
        ticketsSold: event.ticketTypes.reduce((sum, tt) => sum + tt.soldQuantity, 0),
        validatedTickets,
        totalRevenue,
        pendingOrders,
        ordersCount: event._count.orders
      },
      permissions: access.assignment?.permissions
    });

  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Verify coordinator access with canEditEvent permission
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditEvent');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para editar este evento' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Fields that coordinators can edit
    const allowedFields = [
      'name',
      'description',
      'date',
      'doorsOpenAt',
      'endsAt',
      'imageUrl',
      'coverUrl',
      'videoUrl',
      'priceFrom',
      'priceTo',
      'ageRestriction',
      'tags'
    ];

    // Filter out fields that are not allowed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Convert date strings to Date objects
        if (['date', 'doorsOpenAt', 'endsAt'].includes(field) && body[field]) {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        venue: true,
        ticketTypes: true
      }
    });

    // Log the update
    await prisma.auditLog.create({
      data: {
        entityType: 'EVENT',
        entityId: eventId,
        action: 'update',
        performedById: session.user.id,
        performedByType: 'coordinator',
        previousState: {}, // In production, store the previous state
        newState: updateData,
        hash: '', // In production, calculate proper hash
        previousHash: ''
      }
    });

    return NextResponse.json({
      success: true,
      event: {
        ...updatedEvent,
        date: updatedEvent.date.toISOString(),
        doorsOpenAt: updatedEvent.doorsOpenAt?.toISOString() || null,
        endsAt: updatedEvent.endsAt?.toISOString() || null
      }
    });

  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
