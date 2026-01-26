import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/taxes/[id] - Get a single tax
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tax = await prisma.tax.findUnique({
      where: { id },
    });

    if (!tax) {
      return NextResponse.json(
        { error: 'Impuesto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tax });
  } catch (error) {
    console.error('Error fetching tax:', error);
    return NextResponse.json(
      { error: 'Error al obtener el impuesto' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/taxes/[id] - Update a tax
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, code, percentage, description, isActive } = body;

    // Check if tax exists
    const existing = await prisma.tax.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Impuesto no encontrado' },
        { status: 404 }
      );
    }

    // Check for duplicate code if changing it
    if (code && code !== existing.code) {
      const duplicateCode = await prisma.tax.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (duplicateCode) {
        return NextResponse.json(
          { error: `Ya existe un impuesto con el código ${code}` },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (percentage !== undefined) updateData.percentage = parseFloat(percentage);
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const tax = await prisma.tax.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ tax });
  } catch (error) {
    console.error('Error updating tax:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el impuesto' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/taxes/[id] - Delete a tax
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if tax exists
    const existing = await prisma.tax.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Impuesto no encontrado' },
        { status: 404 }
      );
    }

    await prisma.tax.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Impuesto eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting tax:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el impuesto' },
      { status: 500 }
    );
  }
}
