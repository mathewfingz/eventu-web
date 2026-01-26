import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/commissions/[id] - Get a single commission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const commission = await prisma.commission.findUnique({
      where: { id },
    });

    if (!commission) {
      return NextResponse.json(
        { error: 'Comisión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ commission });
  } catch (error) {
    console.error('Error fetching commission:', error);
    return NextResponse.json(
      { error: 'Error al obtener la comisión' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/commissions/[id] - Update a commission
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      minVolume,
      maxVolume,
      percentage,
      fixedFee,
      paymentMethod,
      isActive,
    } = body;

    // Check if commission exists
    const existing = await prisma.commission.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Comisión no encontrada' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (percentage !== undefined) updateData.percentage = parseFloat(percentage);
    if (fixedFee !== undefined) updateData.fixedFee = parseFloat(fixedFee);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Only update volume fields for VOLUME type
    if (existing.type === 'VOLUME') {
      if (minVolume !== undefined) updateData.minVolume = minVolume;
      if (maxVolume !== undefined) updateData.maxVolume = maxVolume;
    }

    // Only update payment method for PAYMENT_METHOD type
    if (existing.type === 'PAYMENT_METHOD' && paymentMethod !== undefined) {
      updateData.paymentMethod = paymentMethod;
    }

    const commission = await prisma.commission.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ commission });
  } catch (error) {
    console.error('Error updating commission:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la comisión' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/commissions/[id] - Delete a commission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if commission exists
    const existing = await prisma.commission.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Comisión no encontrada' },
        { status: 404 }
      );
    }

    await prisma.commission.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Comisión eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting commission:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la comisión' },
      { status: 500 }
    );
  }
}
