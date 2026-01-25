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

    // Verify coordinator access with canEditPresales permission
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditPresales');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para ver las preventas' },
        { status: 403 }
      );
    }

    // Get presales for the event
    const presales = await prisma.presale.findMany({
      where: { eventId },
      include: {
        codes: {
          select: {
            id: true,
            code: true,
            singleUse: true,
            maxUses: true,
            usedAt: true,
            _count: {
              select: { usages: true }
            }
          }
        },
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { priority: 'asc' }
    });

    // Format presales
    const formattedPresales = presales.map(presale => ({
      id: presale.id,
      name: presale.name,
      type: presale.type,
      startDate: presale.startDate.toISOString(),
      endDate: presale.endDate.toISOString(),
      priceModifier: presale.priceModifier,
      totalAllocation: presale.totalAllocation,
      usedAllocation: presale.usedAllocation,
      maxPerUser: presale.maxPerUser,
      priority: presale.priority,
      status: presale.status,
      isActive: presale.status === 'ACTIVE' &&
                new Date() >= presale.startDate &&
                new Date() <= presale.endDate,
      codes: presale.codes.map(code => ({
        id: code.id,
        code: code.code,
        singleUse: code.singleUse,
        maxUses: code.maxUses,
        usageCount: code._count.usages,
        isUsed: code.usedAt !== null
      })),
      totalCodes: presale.codes.length,
      ordersCount: presale._count.orders,
      createdAt: presale.createdAt.toISOString(),
      updatedAt: presale.updatedAt.toISOString()
    }));

    return NextResponse.json({
      presales: formattedPresales,
      total: formattedPresales.length
    });

  } catch (error) {
    console.error('Error fetching presales:', error);
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

    // Verify coordinator access with canEditPresales permission
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canEditPresales');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para crear preventas' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      type,
      startDate,
      endDate,
      priceModifier,
      totalAllocation,
      maxPerUser,
      priority
    } = body;

    // Validate required fields
    if (!name || !type || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Create presale
    const presale = await prisma.presale.create({
      data: {
        eventId,
        name,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        priceModifier: priceModifier || null,
        totalAllocation: totalAllocation || null,
        maxPerUser: maxPerUser || 4,
        priority: priority || 0,
        status: 'ACTIVE'
      }
    });

    // Log the creation
    await prisma.auditLog.create({
      data: {
        entityType: 'EVENT',
        entityId: eventId,
        action: 'create_presale',
        performedById: session.user.id,
        performedByType: 'coordinator',
        newState: { presaleId: presale.id, name, type },
        hash: '',
        previousHash: ''
      }
    });

    return NextResponse.json({
      success: true,
      presale: {
        ...presale,
        startDate: presale.startDate.toISOString(),
        endDate: presale.endDate.toISOString(),
        createdAt: presale.createdAt.toISOString(),
        updatedAt: presale.updatedAt.toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating presale:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
