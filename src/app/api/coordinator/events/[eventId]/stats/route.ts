import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    const eventId = params.eventId;

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: {
          select: {
            id: true,
            name: true,
            quantity: true,
            sold: true,
            color: true
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

    // Get ticket counts by status
    const ticketStats = await prisma.ticket.groupBy({
      by: ['status', 'ticketTypeId'],
      where: {
        ticketType: {
          eventId: eventId
        }
      },
      _count: {
        id: true
      }
    });

    // Calculate totals
    const totalSold = event.ticketTypes.reduce((sum, tt) => sum + tt.sold, 0);

    // Count processed (USED) tickets
    const processedByType: Record<string, number> = {};
    let totalProcessed = 0;

    ticketStats.forEach(stat => {
      if (stat.status === 'USED') {
        processedByType[stat.ticketTypeId] = stat._count.id;
        totalProcessed += stat._count.id;
      }
    });

    // Get hourly breakdown of validations (last 6 hours)
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

    const recentValidations = await prisma.auditLog.findMany({
      where: {
        action: 'TICKET_VALIDATED',
        entityType: 'TICKET',
        createdAt: { gte: sixHoursAgo },
        details: {
          path: ['eventId'],
          equals: eventId
        }
      },
      select: {
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by hour
    const hourlyBreakdown: Array<{ hour: string; count: number; rate: number }> = [];
    const hourCounts: Record<string, number> = {};

    recentValidations.forEach(v => {
      const hour = v.createdAt.toISOString().slice(11, 16).replace(':', 'h').slice(0, 3) + ':00';
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    Object.entries(hourCounts).forEach(([hour, count]) => {
      hourlyBreakdown.push({
        hour,
        count,
        rate: count / 60 // average per minute
      });
    });

    // Calculate processing rate (last 5 minutes)
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const recentCount = await prisma.auditLog.count({
      where: {
        action: 'TICKET_VALIDATED',
        entityType: 'TICKET',
        createdAt: { gte: fiveMinutesAgo },
        details: {
          path: ['eventId'],
          equals: eventId
        }
      }
    });

    const processingRate = recentCount / 5; // per minute

    // Get active validators (users who validated in last 30 minutes)
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    const validatorActivity = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        action: 'TICKET_VALIDATED',
        entityType: 'TICKET',
        createdAt: { gte: thirtyMinutesAgo },
        details: {
          path: ['eventId'],
          equals: eventId
        }
      },
      _count: {
        id: true
      },
      _max: {
        createdAt: true
      }
    });

    // Get validator user info
    const validatorIds = validatorActivity.map(v => v.userId).filter(Boolean) as string[];
    const validators = await prisma.user.findMany({
      where: { id: { in: validatorIds } },
      select: { id: true, name: true, email: true }
    });

    const validatorMap = new Map(validators.map(v => [v.id, v]));

    const activeValidators = validatorActivity
      .filter(v => v.userId)
      .map(v => {
        const user = validatorMap.get(v.userId!);
        const lastValidation = v._max.createdAt;
        const timeSinceLastValidation = lastValidation
          ? (Date.now() - lastValidation.getTime()) / 1000
          : Infinity;

        return {
          id: v.userId!,
          name: user?.name || user?.email?.split('@')[0] || 'Validador',
          email: user?.email || null,
          validationsCount: v._count.id,
          lastValidationAt: lastValidation?.toISOString() || null,
          isActive: timeSinceLastValidation < 300, // Active if validated in last 5 minutes
          deviceInfo: null
        };
      })
      .sort((a, b) => b.validationsCount - a.validationsCount);

    // Build ticket type stats
    const byTicketType = event.ticketTypes.map(tt => ({
      id: tt.id,
      name: tt.name,
      sold: tt.sold,
      processed: processedByType[tt.id] || 0,
      color: tt.color || '#3B82F6'
    }));

    // Check for capacity alerts
    const capacityAlerts: Array<{
      id: string;
      ticketTypeId: string;
      ticketTypeName: string;
      currentCount: number;
      maxCapacity: number;
      alertLevel: 'WARNING' | 'CRITICAL' | 'FULL';
      message: string;
    }> = [];

    byTicketType.forEach(tt => {
      const percentage = (tt.processed / tt.sold) * 100;

      if (percentage >= 100) {
        capacityAlerts.push({
          id: `alert-${tt.id}`,
          ticketTypeId: tt.id,
          ticketTypeName: tt.name,
          currentCount: tt.processed,
          maxCapacity: tt.sold,
          alertLevel: 'FULL',
          message: `${tt.name} ha alcanzado el 100% de capacidad`
        });
      } else if (percentage >= 95) {
        capacityAlerts.push({
          id: `alert-${tt.id}`,
          ticketTypeId: tt.id,
          ticketTypeName: tt.name,
          currentCount: tt.processed,
          maxCapacity: tt.sold,
          alertLevel: 'CRITICAL',
          message: `${tt.name} esta al ${percentage.toFixed(0)}% de capacidad`
        });
      } else if (percentage >= 80) {
        capacityAlerts.push({
          id: `alert-${tt.id}`,
          ticketTypeId: tt.id,
          ticketTypeName: tt.name,
          currentCount: tt.processed,
          maxCapacity: tt.sold,
          alertLevel: 'WARNING',
          message: `${tt.name} esta al ${percentage.toFixed(0)}% de capacidad`
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalSold,
        totalProcessed,
        processingRate,
        byTicketType,
        hourlyBreakdown,
        activeValidators,
        capacityAlerts
      }
    });

  } catch (error) {
    console.error('Error fetching coordinator stats:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
