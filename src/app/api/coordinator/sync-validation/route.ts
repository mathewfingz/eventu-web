import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
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
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Check if user has coordinator permissions
    const allowedRoles = ['SUPERADMIN', 'COORDINATOR', 'PROMOTER'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para esta accion' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      ticketId,
      eventId,
      code,
      deviceId,
      validatedAt,
      offlineValidation
    } = body;

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'ticketId es requerido' },
        { status: 400 }
      );
    }

    // Get current ticket status
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        status: true,
        usedAt: true,
        validatedBy: true
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Check if already validated
    if (ticket.status === 'USED') {
      // Check if this is an idempotent request from the same device
      // If so, consider it successful
      return NextResponse.json({
        success: true,
        message: 'Ticket ya fue validado previamente',
        alreadyProcessed: true
      });
    }

    // Check if ticket is in valid state
    if (ticket.status !== 'ACTIVE') {
      return NextResponse.json({
        success: false,
        error: `Ticket en estado invalido: ${ticket.status}`,
        invalidStatus: true
      });
    }

    // Parse validation time
    const validationTime = validatedAt
      ? new Date(validatedAt)
      : new Date();

    // Update ticket to USED
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'USED',
        usedAt: validationTime,
        validatedBy: session.user.id
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'TICKET_VALIDATED',
        entityType: 'TICKET',
        entityId: ticketId,
        userId: session.user.id,
        details: {
          eventId: eventId || null,
          code,
          deviceId,
          validatedAt: validationTime.toISOString(),
          offlineValidation: offlineValidation || false,
          syncedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Validacion sincronizada correctamente'
    });

  } catch (error) {
    console.error('Error syncing validation:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
