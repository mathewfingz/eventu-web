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

    // Verify coordinator access with canEditTicketTypes permission
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditTicketTypes');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para ver los tipos de boletas' },
        { status: 403 }
      );
    }

    // Get ticket types for the event
    const ticketTypes = await prisma.ticketType.findMany({
      where: { eventId },
      orderBy: { price: 'asc' }
    });

    // Format ticket types
    const formattedTicketTypes = ticketTypes.map(tt => ({
      id: tt.id,
      name: tt.name,
      description: tt.description,
      price: tt.price,
      totalQuantity: tt.totalQuantity,
      soldQuantity: tt.soldQuantity,
      availableQuantity: tt.totalQuantity - tt.soldQuantity,
      maxPerOrder: tt.maxPerOrder,
      minPerOrder: tt.minPerOrder,
      sectionId: tt.sectionId,
      saleStartsAt: tt.saleStartsAt?.toISOString() || null,
      saleEndsAt: tt.saleEndsAt?.toISOString() || null,
      isOnSale: tt.saleStartsAt && tt.saleEndsAt
        ? new Date() >= tt.saleStartsAt && new Date() <= tt.saleEndsAt
        : true,
      soldPercentage: tt.totalQuantity > 0
        ? Math.round((tt.soldQuantity / tt.totalQuantity) * 100)
        : 0,
      createdAt: tt.createdAt.toISOString(),
      updatedAt: tt.updatedAt.toISOString()
    }));

    // Calculate summary
    const summary = {
      totalTypes: ticketTypes.length,
      totalCapacity: ticketTypes.reduce((sum, tt) => sum + tt.totalQuantity, 0),
      totalSold: ticketTypes.reduce((sum, tt) => sum + tt.soldQuantity, 0),
      totalAvailable: ticketTypes.reduce((sum, tt) => sum + (tt.totalQuantity - tt.soldQuantity), 0),
      totalRevenue: ticketTypes.reduce((sum, tt) => sum + (tt.soldQuantity * tt.price), 0)
    };

    return NextResponse.json({
      ticketTypes: formattedTicketTypes,
      summary
    });

  } catch (error) {
    console.error('Error fetching ticket types:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Verify coordinator access with canEditTicketTypes permission
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditTicketTypes');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para crear tipos de boletas' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      totalQuantity,
      maxPerOrder,
      minPerOrder,
      sectionId,
      saleStartsAt,
      saleEndsAt
    } = body;

    // Validate required fields
    if (!name || price === undefined || !totalQuantity) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: nombre, precio y cantidad total' },
        { status: 400 }
      );
    }

    // Validate price and quantity
    if (price < 0 || totalQuantity < 1) {
      return NextResponse.json(
        { error: 'El precio debe ser positivo y la cantidad mayor a 0' },
        { status: 400 }
      );
    }

    // Create ticket type
    const ticketType = await prisma.ticketType.create({
      data: {
        eventId,
        name,
        description: description || null,
        price,
        totalQuantity,
        soldQuantity: 0,
        maxPerOrder: maxPerOrder || 6,
        minPerOrder: minPerOrder || 1,
        sectionId: sectionId || null,
        saleStartsAt: saleStartsAt ? new Date(saleStartsAt) : null,
        saleEndsAt: saleEndsAt ? new Date(saleEndsAt) : null
      }
    });

    // Update event price range
    const allTicketTypes = await prisma.ticketType.findMany({
      where: { eventId },
      select: { price: true }
    });

    const prices = allTicketTypes.map(tt => tt.price);
    await prisma.event.update({
      where: { id: eventId },
      data: {
        priceFrom: Math.min(...prices),
        priceTo: Math.max(...prices)
      }
    });

    // Log the creation
    await prisma.auditLog.create({
      data: {
        entityType: 'EVENT',
        entityId: eventId,
        action: 'create_ticket_type',
        performedById: session.user.id,
        performedByType: 'coordinator',
        newState: { ticketTypeId: ticketType.id, name, price, totalQuantity },
        hash: '',
        previousHash: ''
      }
    });

    return NextResponse.json({
      success: true,
      ticketType: {
        ...ticketType,
        saleStartsAt: ticketType.saleStartsAt?.toISOString() || null,
        saleEndsAt: ticketType.saleEndsAt?.toISOString() || null,
        createdAt: ticketType.createdAt.toISOString(),
        updatedAt: ticketType.updatedAt.toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating ticket type:', error);
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

    // Verify coordinator access with canEditTicketTypes permission
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditTicketTypes');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para editar tipos de boletas' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ticketTypeId, ...updateFields } = body;

    if (!ticketTypeId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del tipo de boleta' },
        { status: 400 }
      );
    }

    // Verify ticket type belongs to event
    const existingTicketType = await prisma.ticketType.findFirst({
      where: {
        id: ticketTypeId,
        eventId
      }
    });

    if (!existingTicketType) {
      return NextResponse.json(
        { error: 'Tipo de boleta no encontrado' },
        { status: 404 }
      );
    }

    // Allowed fields for update
    const allowedFields = [
      'name',
      'description',
      'price',
      'totalQuantity',
      'maxPerOrder',
      'minPerOrder',
      'sectionId',
      'saleStartsAt',
      'saleEndsAt'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        if (['saleStartsAt', 'saleEndsAt'].includes(field) && updateFields[field]) {
          updateData[field] = new Date(updateFields[field]);
        } else {
          updateData[field] = updateFields[field];
        }
      }
    }

    // Validate that new totalQuantity is not less than soldQuantity
    if (updateData.totalQuantity !== undefined && updateData.totalQuantity < existingTicketType.soldQuantity) {
      return NextResponse.json(
        { error: `La cantidad total no puede ser menor que la cantidad vendida (${existingTicketType.soldQuantity})` },
        { status: 400 }
      );
    }

    // Update ticket type
    const updatedTicketType = await prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: updateData
    });

    // Update event price range if price changed
    if (updateData.price !== undefined) {
      const allTicketTypes = await prisma.ticketType.findMany({
        where: { eventId },
        select: { price: true }
      });

      const prices = allTicketTypes.map(tt => tt.price);
      await prisma.event.update({
        where: { id: eventId },
        data: {
          priceFrom: Math.min(...prices),
          priceTo: Math.max(...prices)
        }
      });
    }

    return NextResponse.json({
      success: true,
      ticketType: {
        ...updatedTicketType,
        saleStartsAt: updatedTicketType.saleStartsAt?.toISOString() || null,
        saleEndsAt: updatedTicketType.saleEndsAt?.toISOString() || null,
        createdAt: updatedTicketType.createdAt.toISOString(),
        updatedAt: updatedTicketType.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating ticket type:', error);
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

    // Verify coordinator access with canEditTicketTypes permission
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditTicketTypes');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para eliminar tipos de boletas' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ticketTypeId = searchParams.get('ticketTypeId');

    if (!ticketTypeId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del tipo de boleta' },
        { status: 400 }
      );
    }

    // Verify ticket type belongs to event and has no sales
    const existingTicketType = await prisma.ticketType.findFirst({
      where: {
        id: ticketTypeId,
        eventId
      }
    });

    if (!existingTicketType) {
      return NextResponse.json(
        { error: 'Tipo de boleta no encontrado' },
        { status: 404 }
      );
    }

    if (existingTicketType.soldQuantity > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un tipo de boleta con ventas' },
        { status: 400 }
      );
    }

    // Delete ticket type
    await prisma.ticketType.delete({
      where: { id: ticketTypeId }
    });

    // Update event price range
    const remainingTicketTypes = await prisma.ticketType.findMany({
      where: { eventId },
      select: { price: true }
    });

    if (remainingTicketTypes.length > 0) {
      const prices = remainingTicketTypes.map(tt => tt.price);
      await prisma.event.update({
        where: { id: eventId },
        data: {
          priceFrom: Math.min(...prices),
          priceTo: Math.max(...prices)
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Tipo de boleta eliminado correctamente'
    });

  } catch (error) {
    console.error('Error deleting ticket type:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
