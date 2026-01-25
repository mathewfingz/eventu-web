import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyCoordinatorAccess } from '@/lib/coordinator-auth';

// Generate random code
function generateCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
        { error: access.error || 'No tienes permiso para ver los codigos' },
        { status: 403 }
      );
    }

    // Verify presale belongs to event
    const presale = await prisma.presale.findFirst({
      where: {
        id: presaleId,
        eventId
      }
    });

    if (!presale) {
      return NextResponse.json(
        { error: 'Preventa no encontrada' },
        { status: 404 }
      );
    }

    // Get codes
    const codes = await prisma.presaleCode.findMany({
      where: { presaleId },
      include: {
        usages: {
          select: {
            userId: true,
            usedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedCodes = codes.map(code => ({
      id: code.id,
      code: code.code,
      singleUse: code.singleUse,
      maxUses: code.maxUses,
      usageCount: code.usages.length,
      isUsed: code.usedAt !== null,
      usedAt: code.usedAt?.toISOString() || null,
      usedById: code.usedById,
      createdAt: code.createdAt.toISOString(),
      usages: code.usages.map(usage => ({
        userId: usage.userId,
        usedAt: usage.usedAt.toISOString()
      }))
    }));

    return NextResponse.json({
      codes: formattedCodes,
      total: formattedCodes.length,
      summary: {
        totalCodes: codes.length,
        usedCodes: codes.filter(c => c.usedAt !== null).length,
        availableCodes: codes.filter(c => c.usedAt === null).length
      }
    });

  } catch (error) {
    console.error('Error fetching presale codes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
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
        { error: access.error || 'No tienes permiso para crear codigos' },
        { status: 403 }
      );
    }

    // Verify presale belongs to event
    const presale = await prisma.presale.findFirst({
      where: {
        id: presaleId,
        eventId
      }
    });

    if (!presale) {
      return NextResponse.json(
        { error: 'Preventa no encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { quantity = 1, singleUse = true, maxUses, prefix = '' } = body;

    // Validate quantity
    if (quantity < 1 || quantity > 1000) {
      return NextResponse.json(
        { error: 'La cantidad debe estar entre 1 y 1000' },
        { status: 400 }
      );
    }

    // Generate unique codes
    const existingCodes = await prisma.presaleCode.findMany({
      where: { presaleId },
      select: { code: true }
    });
    const existingCodeSet = new Set(existingCodes.map(c => c.code));

    const newCodes: { code: string; singleUse: boolean; maxUses: number | null }[] = [];
    let attempts = 0;
    const maxAttempts = quantity * 10;

    while (newCodes.length < quantity && attempts < maxAttempts) {
      const code = prefix ? `${prefix}-${generateCode(6)}` : generateCode(8);
      if (!existingCodeSet.has(code)) {
        newCodes.push({
          code,
          singleUse,
          maxUses: maxUses || null
        });
        existingCodeSet.add(code);
      }
      attempts++;
    }

    if (newCodes.length < quantity) {
      return NextResponse.json(
        { error: 'No se pudieron generar todos los codigos unicos' },
        { status: 500 }
      );
    }

    // Create codes in database
    const createdCodes = await prisma.presaleCode.createMany({
      data: newCodes.map(c => ({
        presaleId,
        code: c.code,
        singleUse: c.singleUse,
        maxUses: c.maxUses
      }))
    });

    // Log the creation
    await prisma.auditLog.create({
      data: {
        entityType: 'EVENT',
        entityId: eventId,
        action: 'create_presale_codes',
        performedById: session.user.id,
        performedByType: 'coordinator',
        newState: { presaleId, quantity: newCodes.length, singleUse },
        hash: '',
        previousHash: ''
      }
    });

    return NextResponse.json({
      success: true,
      codes: newCodes.map(c => c.code),
      count: createdCodes.count
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating presale codes:', error);
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
        { error: access.error || 'No tienes permiso para eliminar codigos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { codeIds } = body;

    if (!codeIds || !Array.isArray(codeIds) || codeIds.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere una lista de IDs de codigos' },
        { status: 400 }
      );
    }

    // Delete only unused codes
    const deletedCodes = await prisma.presaleCode.deleteMany({
      where: {
        id: { in: codeIds },
        presaleId,
        usedAt: null
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: deletedCodes.count
    });

  } catch (error) {
    console.error('Error deleting presale codes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
