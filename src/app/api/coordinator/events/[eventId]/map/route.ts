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

    // Verify coordinator access with canEditMap permission
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditMap');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para ver el mapa' },
        { status: 403 }
      );
    }

    // Get event's map
    const map = await prisma.venueMap.findFirst({
      where: { eventId },
      include: {
        sections: {
          include: {
            seats: true,
            tables: true
          }
        },
        elements: true
      }
    });

    if (!map) {
      // Check if venue has a template map
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          venue: {
            include: {
              maps: {
                where: { isTemplate: true },
                take: 1
              }
            }
          }
        }
      });

      return NextResponse.json({
        map: null,
        venueTemplate: event?.venue?.maps?.[0] || null,
        message: 'No hay mapa configurado para este evento'
      });
    }

    // Get inventory stats for each section
    const sectionsWithStats = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.sections.map(async (section: any) => {
        const ticketType = section.ticketTypeId
          ? await prisma.ticketType.findUnique({
            where: { id: section.ticketTypeId },
            select: {
              id: true,
              name: true,
              price: true,
              totalQuantity: true,
              soldQuantity: true
            }
          })
          : null;

        // Count seat statuses
        const seatStats = {
          total: section.seats.length,
          available: section.seats.filter((s: { status: string }) => s.status === 'AVAILABLE').length,
          sold: section.seats.filter((s: { status: string }) => s.status === 'SOLD').length,
          reserved: section.seats.filter((s: { status: string }) => s.status === 'RESERVED').length,
          blocked: section.seats.filter((s: { status: string }) => s.status === 'BLOCKED').length
        };

        return {
          ...section,
          ticketType,
          seatStats,
          createdAt: section.createdAt.toISOString(),
          updatedAt: section.updatedAt.toISOString()
        };
      })
    );

    return NextResponse.json({
      map: {
        id: map.id,
        name: map.name,
        width: map.width,
        height: map.height,
        backgroundColor: map.backgroundColor,
        backgroundImage: map.backgroundImage,
        gridSize: map.gridSize,
        showGrid: map.showGrid,
        version: map.version,
        createdAt: map.createdAt.toISOString(),
        updatedAt: map.updatedAt.toISOString(),
        sections: sectionsWithStats,
        elements: map.elements.map(el => ({
          ...el,
          createdAt: el.createdAt.toISOString()
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching event map:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Verify coordinator access with canEditMap permission
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditMap');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para editar el mapa' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, width, height, backgroundColor, backgroundImage, gridSize, showGrid, sections, elements } = body;

    // Check if map exists for event
    let map = await prisma.venueMap.findFirst({
      where: { eventId }
    });

    if (map) {
      // Update existing map
      map = await prisma.venueMap.update({
        where: { id: map.id },
        data: {
          name: name || map.name,
          width: width || map.width,
          height: height || map.height,
          backgroundColor: backgroundColor || map.backgroundColor,
          backgroundImage: backgroundImage !== undefined ? backgroundImage : map.backgroundImage,
          gridSize: gridSize || map.gridSize,
          showGrid: showGrid !== undefined ? showGrid : map.showGrid,
          version: { increment: 1 }
        }
      });
    } else {
      // Create new map for event
      map = await prisma.venueMap.create({
        data: {
          name: name || 'Mapa del Evento',
          eventId,
          width: width || 1200,
          height: height || 800,
          backgroundColor: backgroundColor || '#f5f5f5',
          backgroundImage,
          gridSize: gridSize || 20,
          showGrid: showGrid !== undefined ? showGrid : true,
          isTemplate: false
        }
      });
    }

    // Update sections if provided
    if (sections && Array.isArray(sections)) {
      // Delete removed sections (this will cascade to seats/tables)
      const sectionIds = sections.filter((s: { id?: string }) => s.id).map((s: { id: string }) => s.id);
      await prisma.mapSection.deleteMany({
        where: {
          mapId: map.id,
          id: { notIn: sectionIds }
        }
      });

      // Upsert sections
      for (const section of sections) {
        if (section.id) {
          await prisma.mapSection.update({
            where: { id: section.id },
            data: {
              name: section.name,
              type: section.type,
              color: section.color,
              shape: section.shape,
              path: section.path,
              x: section.x,
              y: section.y,
              width: section.width,
              height: section.height,
              rotation: section.rotation || 0,
              capacity: section.capacity,
              description: section.description,
              starRating: section.starRating,
              isActive: section.isActive !== false,
              layer: section.layer || 1,
              opacity: section.opacity || 1,
              ticketTypeId: section.ticketTypeId,
              rowConfig: section.rowConfig
            }
          });
        } else {
          await prisma.mapSection.create({
            data: {
              mapId: map.id,
              name: section.name,
              type: section.type || 'GENERAL_ADMISSION',
              color: section.color || '#3B82F6',
              shape: section.shape || 'rectangle',
              path: section.path,
              x: section.x,
              y: section.y,
              width: section.width,
              height: section.height,
              rotation: section.rotation || 0,
              capacity: section.capacity || 0,
              description: section.description,
              starRating: section.starRating,
              isActive: section.isActive !== false,
              layer: section.layer || 1,
              opacity: section.opacity || 1,
              ticketTypeId: section.ticketTypeId,
              rowConfig: section.rowConfig
            }
          });
        }
      }
    }

    // Update elements if provided
    if (elements && Array.isArray(elements)) {
      // Delete existing elements and recreate
      await prisma.mapElement.deleteMany({
        where: { mapId: map.id }
      });

      await prisma.mapElement.createMany({
        data: elements.map((el: any) => ({
          mapId: map!.id,
          type: el.type,
          name: el.name,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rotation: el.rotation || 0,
          color: el.color,
          icon: el.icon,
          text: el.text,
          fontSize: el.fontSize,
          imageUrl: el.imageUrl,
          layer: el.layer || 0,
          isLocked: el.isLocked || false
        }))
      });
    }

    // Log the update
    await prisma.auditLog.create({
      data: {
        entityType: 'EVENT',
        entityId: eventId,
        action: 'update_map',
        performedById: session.user.id,
        performedByType: 'coordinator',
        newState: { mapId: map.id, version: map.version },
        hash: '',
        previousHash: ''
      }
    });

    // Fetch updated map with all relations
    const updatedMap = await prisma.venueMap.findUnique({
      where: { id: map.id },
      include: {
        sections: {
          include: {
            seats: true,
            tables: true
          }
        },
        elements: true
      }
    });

    return NextResponse.json({
      success: true,
      map: updatedMap
    });

  } catch (error) {
    console.error('Error updating event map:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify coordinator access with canEditMap permission
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditMap');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para eliminar el mapa' },
        { status: 403 }
      );
    }

    // Find and delete map
    const map = await prisma.venueMap.findFirst({
      where: { eventId }
    });

    if (!map) {
      return NextResponse.json(
        { error: 'Mapa no encontrado' },
        { status: 404 }
      );
    }

    // Check if any seats are sold
    const soldSeats = await prisma.mapSeat.count({
      where: {
        section: { mapId: map.id },
        status: 'SOLD'
      }
    });

    if (soldSeats > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el mapa porque tiene asientos vendidos' },
        { status: 400 }
      );
    }

    // Delete map (cascade will delete sections, seats, tables, elements)
    await prisma.venueMap.delete({
      where: { id: map.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Mapa eliminado correctamente'
    });

  } catch (error) {
    console.error('Error deleting event map:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
