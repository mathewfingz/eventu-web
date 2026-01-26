import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Get single user
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: {
                        eventsAsPromoter: true,
                        orders: true,
                        tickets: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Error al obtener usuario' },
            { status: 500 }
        );
    }
}

// PATCH - Update user
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const body = await request.json();
        const { name, phone, role, promoterType, nit, businessName, status } = body;

        const updateData: Record<string, any> = {};

        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (role !== undefined) updateData.role = role;
        if (promoterType !== undefined) updateData.promoterType = promoterType;
        if (nit !== undefined) updateData.nit = nit;
        if (businessName !== undefined) updateData.businessName = businessName;

        // Handle status changes
        if (status === 'ACTIVE') {
            updateData.emailVerified = new Date();
        } else if (status === 'INACTIVE') {
            updateData.emailVerified = null;
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                emailVerified: true,
                promoterType: true,
                nit: true,
                businessName: true,
                updatedAt: true,
            }
        });

        return NextResponse.json({ user, message: 'Usuario actualizado' });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Error al actualizar usuario' },
            { status: 500 }
        );
    }
}

// DELETE - Delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: {
                        eventsAsPromoter: true,
                        orders: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Prevent deleting users with events or orders
        if (user._count.eventsAsPromoter > 0 || user._count.orders > 0) {
            return NextResponse.json(
                { error: 'No se puede eliminar un usuario con eventos u órdenes asociadas' },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Error al eliminar usuario' },
            { status: 500 }
        );
    }
}
