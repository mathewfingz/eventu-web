import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Check if user has coordinator permissions
    const allowedRoles = ['SUPERADMIN', 'COORDINATOR', 'PROMOTER'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta funcionalidad' },
        { status: 403 }
      );
    }

    const { eventId } = await params;

    // Verify event exists and user has access
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        promoterId: true
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // If PROMOTER, verify ownership
    if (user.role === 'PROMOTER' && event.promoterId !== user.id) {
      return NextResponse.json(
        { error: 'No tienes acceso a este evento' },
        { status: 403 }
      );
    }

    // Fetch all ACTIVE tickets for this event with safetix secrets
    // Only include tickets that are active (not used, not cancelled)
    const tickets = await prisma.ticket.findMany({
      where: {
        ticketType: {
          eventId: eventId
        },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        safetixSecret: true,
        status: true,
        seatRow: true,
        seatNumber: true,
        section: true,
        ticketType: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        },
        order: {
          select: {
            status: true
          }
        }
      }
    });

    // Calculate expiration (24 hours from now)
    const downloadedAt = Date.now();
    const expiresAt = downloadedAt + (24 * 60 * 60 * 1000);

    // Format tickets for offline cache
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      ticketTypeId: ticket.ticketType.id,
      ticketTypeName: ticket.ticketType.name,
      section: ticket.section,
      seatRow: ticket.seatRow,
      seatNumber: ticket.seatNumber,
      safetixSecret: ticket.safetixSecret || '',
      status: ticket.status,
      buyerName: ticket.user?.name || null,
      buyerEmail: ticket.user?.email || null
    }));

    // Log the download for audit
    await prisma.auditLog.create({
      data: {
        action: 'OFFLINE_DOWNLOAD',
        entityType: 'EVENT',
        entityId: eventId,
        performedById: session.user.id,
        performedByType: 'COORDINATOR',
        hash: 'OFFLINE_DOWNLOAD', // Placeholder
        previousHash: 'GENESIS', // Placeholder
        metadata: {
          ticketCount: formattedTickets.length,
          downloadedAt: new Date().toISOString()
        }
      }
    }).catch(() => {
      // Audit log failure shouldn't break the request
    });

    return NextResponse.json({
      tickets: formattedTickets,
      downloadedAt,
      expiresAt
    });

  } catch (error) {
    console.error('Error fetching offline tickets:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
