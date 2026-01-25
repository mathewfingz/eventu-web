import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/taxes - List all taxes
export async function GET() {
  try {
    const taxes = await prisma.tax.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ taxes });
  } catch (error) {
    console.error('Error fetching taxes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los impuestos' },
      { status: 500 }
    );
  }
}

// POST /api/admin/taxes - Create a new tax
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, percentage, description } = body;

    // Validation
    if (!name || !code || percentage === undefined) {
      return NextResponse.json(
        { error: 'Nombre, código y porcentaje son requeridos' },
        { status: 400 }
      );
    }

    // Check for duplicate code
    const existing = await prisma.tax.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un impuesto con el código ${code}` },
        { status: 409 }
      );
    }

    const tax = await prisma.tax.create({
      data: {
        name,
        code: code.toUpperCase(),
        percentage: parseFloat(percentage),
        description: description || null,
        isActive: true,
      },
    });

    return NextResponse.json({ tax }, { status: 201 });
  } catch (error) {
    console.error('Error creating tax:', error);
    return NextResponse.json(
      { error: 'Error al crear el impuesto' },
      { status: 500 }
    );
  }
}
