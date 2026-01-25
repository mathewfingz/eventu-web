import { prisma } from '@/lib/prisma';

export interface CoordinatorPermissions {
  canViewOrders: boolean;
  canEditPresales: boolean;
  canEditMap: boolean;
  canUploadImages: boolean;
  canEditTicketTypes: boolean;
  canEditEvent: boolean;
  canViewReports: boolean;
  canScan: boolean;
}

export interface CoordinatorAssignmentResult {
  authorized: boolean;
  assignment?: {
    id: string;
    coordinatorId: string;
    eventId: string;
    permissions: CoordinatorPermissions;
    assignedAt: Date;
    isActive: boolean;
  };
  error?: string;
}

type PermissionKey = keyof CoordinatorPermissions;

/**
 * Verifica si un usuario tiene acceso de coordinador a un evento específico
 * @param userId - ID del usuario
 * @param eventId - ID del evento
 * @param requiredPermission - Permiso específico requerido (opcional)
 * @returns Resultado de autorización con detalles de asignación
 */
export async function verifyCoordinatorAccess(
  userId: string,
  eventId: string,
  requiredPermission?: PermissionKey
): Promise<CoordinatorAssignmentResult> {
  try {
    // Primero verificar si el usuario es SUPERADMIN (acceso total)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return {
        authorized: false,
        error: 'Usuario no encontrado'
      };
    }

    // SUPERADMIN tiene acceso a todo
    if (user.role === 'SUPERADMIN') {
      return {
        authorized: true,
        assignment: {
          id: 'superadmin',
          coordinatorId: userId,
          eventId: eventId,
          permissions: {
            canViewOrders: true,
            canEditPresales: true,
            canEditMap: true,
            canUploadImages: true,
            canEditTicketTypes: true,
            canEditEvent: true,
            canViewReports: true,
            canScan: true
          },
          assignedAt: new Date(),
          isActive: true
        }
      };
    }

    // Verificar si el usuario es COORDINATOR
    if (user.role !== 'COORDINATOR') {
      return {
        authorized: false,
        error: 'El usuario no tiene rol de coordinador'
      };
    }

    // Buscar asignación activa
    const assignment = await prisma.coordinatorAssignment.findFirst({
      where: {
        coordinatorId: userId,
        eventId: eventId,
        isActive: true
      }
    });

    if (!assignment) {
      return {
        authorized: false,
        error: 'No tienes acceso a este evento'
      };
    }

    // Verificar permiso específico si se requiere
    if (requiredPermission) {
      const hasPermission = assignment[requiredPermission];
      if (!hasPermission) {
        return {
          authorized: false,
          error: `No tienes permiso para esta acción: ${requiredPermission}`
        };
      }
    }

    return {
      authorized: true,
      assignment: {
        id: assignment.id,
        coordinatorId: assignment.coordinatorId,
        eventId: assignment.eventId,
        permissions: {
          canViewOrders: assignment.canViewOrders,
          canEditPresales: assignment.canEditPresales,
          canEditMap: assignment.canEditMap,
          canUploadImages: assignment.canUploadImages,
          canEditTicketTypes: assignment.canEditTicketTypes,
          canEditEvent: assignment.canEditEvent,
          canViewReports: assignment.canViewReports,
          canScan: assignment.canScan
        },
        assignedAt: assignment.assignedAt,
        isActive: assignment.isActive
      }
    };
  } catch (error) {
    console.error('Error verifying coordinator access:', error);
    return {
      authorized: false,
      error: 'Error al verificar acceso'
    };
  }
}

/**
 * Obtiene todos los eventos asignados a un coordinador
 * @param userId - ID del usuario coordinador
 * @returns Lista de eventos asignados con sus permisos
 */
export async function getCoordinatorEvents(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return { events: [], error: 'Usuario no encontrado' };
    }

    // SUPERADMIN ve todos los eventos
    if (user.role === 'SUPERADMIN') {
      const events = await prisma.event.findMany({
        include: {
          venue: true,
          ticketTypes: true,
          _count: {
            select: {
              orders: true,
              tickets: true
            }
          }
        },
        orderBy: { date: 'asc' }
      });

      return {
        events: events.map(event => ({
          ...event,
          permissions: {
            canViewOrders: true,
            canEditPresales: true,
            canEditMap: true,
            canUploadImages: true,
            canEditTicketTypes: true,
            canEditEvent: true,
            canViewReports: true,
            canScan: true
          }
        }))
      };
    }

    // Coordinadores ven solo eventos asignados
    const assignments = await prisma.coordinatorAssignment.findMany({
      where: {
        coordinatorId: userId,
        isActive: true
      },
      include: {
        event: {
          include: {
            venue: true,
            ticketTypes: true,
            _count: {
              select: {
                orders: true,
                tickets: true
              }
            }
          }
        }
      }
    });

    return {
      events: assignments.map(assignment => ({
        ...assignment.event,
        permissions: {
          canViewOrders: assignment.canViewOrders,
          canEditPresales: assignment.canEditPresales,
          canEditMap: assignment.canEditMap,
          canUploadImages: assignment.canUploadImages,
          canEditTicketTypes: assignment.canEditTicketTypes,
          canEditEvent: assignment.canEditEvent,
          canViewReports: assignment.canViewReports,
          canScan: assignment.canScan
        }
      }))
    };
  } catch (error) {
    console.error('Error getting coordinator events:', error);
    return { events: [], error: 'Error al obtener eventos' };
  }
}

/**
 * Verifica si un usuario puede realizar una acción específica
 * Utilidad para verificar permisos rápidamente en componentes
 */
export function canPerformAction(
  permissions: CoordinatorPermissions | undefined,
  action: PermissionKey
): boolean {
  if (!permissions) return false;
  return permissions[action] === true;
}
