import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/commissions - List all commissions
export async function GET() {
  try {
    const commissions = await prisma.commission.findMany({
      orderBy: [
        { type: 'asc' },
        { minVolume: 'asc' },
      ],
    });

    return NextResponse.json({ commissions });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { error: 'Error al obtener las comisiones' },
      { status: 500 }
    );
  }
}

// POST /api/admin/commissions - Create a new commission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      minVolume,
      maxVolume,
      percentage,
      fixedFee,
      paymentMethod,
    } = body;

    // Validation
    if (!name || !type || percentage === undefined) {
      return NextResponse.json(
        { error: 'Nombre, tipo y porcentaje son requeridos' },
        { status: 400 }
      );
    }

    if (type !== 'VOLUME' && type !== 'PAYMENT_METHOD') {
      return NextResponse.json(
        { error: 'Tipo de comisión inválido' },
        { status: 400 }
      );
    }

    if (type === 'PAYMENT_METHOD' && !paymentMethod) {
      return NextResponse.json(
        { error: 'Método de pago requerido para comisiones por método' },
        { status: 400 }
      );
    }

    // Check for duplicate payment method commission
    if (type === 'PAYMENT_METHOD') {
      const existing = await prisma.commission.findFirst({
        where: {
          type: 'PAYMENT_METHOD',
          paymentMethod,
          isActive: true,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: `Ya existe una comisión activa para ${paymentMethod}` },
          { status: 409 }
        );
      }
    }

    const commission = await prisma.commission.create({
      data: {
        name,
        type,
        minVolume: type === 'VOLUME' ? minVolume : null,
        maxVolume: type === 'VOLUME' ? maxVolume : null,
        percentage: parseFloat(percentage),
        fixedFee: parseFloat(fixedFee || '0'),
        paymentMethod: type === 'PAYMENT_METHOD' ? paymentMethod : null,
        isActive: true,
      },
    });

    return NextResponse.json({ commission }, { status: 201 });
  } catch (error) {
    console.error('Error creating commission:', error);
    return NextResponse.json(
      { error: 'Error al crear la comisión' },
      { status: 500 }
    );
  }
}
