import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyCoordinatorAccess } from '@/lib/coordinator-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; presaleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { eventId, presaleId } = await params;

    // Verify coordinator access
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditPresales');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para ver esta preventa' },
        { status: 403 }
      );
    }

    // Get presale with details
    const presale = await prisma.presale.findFirst({
      where: {
        id: presaleId,
        eventId
      },
      include: {
        codes: {
          include: {
            _count: {
              select: { usages: true }
            }
          }
        },
        accessRules: true,
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!presale) {
      return NextResponse.json(
        { error: 'Preventa no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      presale: {
        ...presale,
        startDate: presale.startDate.toISOString(),
        endDate: presale.endDate.toISOString(),
        createdAt: presale.createdAt.toISOString(),
        updatedAt: presale.updatedAt.toISOString(),
        codes: presale.codes.map(code => ({
          ...code,
          usageCount: code._count.usages,
          createdAt: code.createdAt.toISOString(),
          usedAt: code.usedAt?.toISOString() || null
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching presale:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; presaleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { eventId, presaleId } = await params;

    // Verify coordinator access
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditPresales');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para editar esta preventa' },
        { status: 403 }
      );
    }

    // Verify presale belongs to event
    const existingPresale = await prisma.presale.findFirst({
      where: {
        id: presaleId,
        eventId
      }
    });

    if (!existingPresale) {
      return NextResponse.json(
        { error: 'Preventa no encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Allowed fields for update
    const allowedFields = [
      'name',
      'startDate',
      'endDate',
      'priceModifier',
      'totalAllocation',
      'maxPerUser',
      'priority',
      'status'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (['startDate', 'endDate'].includes(field) && body[field]) {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Update presale
    const updatedPresale = await prisma.presale.update({
      where: { id: presaleId },
      data: updateData
    });

    // Log the update
    await prisma.auditLog.create({
      data: {
        entityType: 'EVENT',
        entityId: eventId,
        action: 'update_presale',
        performedById: session.user.id,
        performedByType: 'coordinator',
        previousState: { presaleId },
        newState: updateData,
        hash: '',
        previousHash: ''
      }
    });

    return NextResponse.json({
      success: true,
      presale: {
        ...updatedPresale,
        startDate: updatedPresale.startDate.toISOString(),
        endDate: updatedPresale.endDate.toISOString(),
        createdAt: updatedPresale.createdAt.toISOString(),
        updatedAt: updatedPresale.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating presale:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; presaleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { eventId, presaleId } = await params;

    // Verify coordinator access
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditPresales');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para eliminar esta preventa' },
        { status: 403 }
      );
    }

    // Verify presale belongs to event and has no orders
    const existingPresale = await prisma.presale.findFirst({
      where: {
        id: presaleId,
        eventId
      },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!existingPresale) {
      return NextResponse.json(
        { error: 'Preventa no encontrada' },
        { status: 404 }
      );
    }

    // Prevent deletion if presale has orders
    if (existingPresale._count.orders > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una preventa con ordenes asociadas' },
        { status: 400 }
      );
    }

    // Delete presale (cascade will delete codes)
    await prisma.presale.delete({
      where: { id: presaleId }
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        entityType: 'EVENT',
        entityId: eventId,
        action: 'delete_presale',
        performedById: session.user.id,
        performedByType: 'coordinator',
        previousState: { presaleId, name: existingPresale.name },
        newState: {},
        hash: '',
        previousHash: ''
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Preventa eliminada correctamente'
    });

  } catch (error) {
    console.error('Error deleting presale:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
