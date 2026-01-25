import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all users with optional filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: any = {};

        // Search filter
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Role filter
        if (role && role !== 'all') {
            where.role = role;
        }

        // Get users with pagination
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    image: true,
                    emailVerified: true,
                    lastLoginAt: true,
                    promoterType: true,
                    nit: true,
                    businessName: true,
                    totalEvents: true,
                    createdAt: true,
                    _count: {
                        select: {
                            eventsAsPromoter: true,
                            orders: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        // Transform users to include computed fields
        const transformedUsers = users.map((user: typeof users[number]) => ({
            ...user,
            eventsCount: user._count.eventsAsPromoter,
            status: user.emailVerified ? 'ACTIVE' : 'PENDING',
        }));

        return NextResponse.json({
            users: transformedUsers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Error al obtener usuarios' },
            { status: 500 }
        );
    }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, role, promoterType, nit, businessName, venue } = body;

        // Validate required fields
        if (!name || !email || !role) {
            return NextResponse.json(
                { error: 'Nombre, email y rol son requeridos' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Ya existe un usuario con este email' },
                { status: 409 }
            );
        }

        // Use transaction to ensure both user and potential venue are created together
        const result = await prisma.$transaction(async (tx: typeof prisma) => {
            // Create user
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    phone: phone || null,
                    role,
                    promoterType: role === 'PROMOTER' ? promoterType : null,
                    nit: role === 'PROMOTER' ? nit : null,
                    businessName: role === 'PROMOTER' ? businessName : null,
                },
            });

            // If role is VENUE, create the associated Venue
            if (role === 'VENUE' && venue) {
                await tx.venue.create({
                    data: {
                        name: venue.name,
                        slug: venue.slug,
                        address: venue.address,
                        city: venue.city,
                        totalCapacity: venue.totalCapacity,
                        operatorId: newUser.id,
                    },
                });
            }

            return newUser;
        });

        return NextResponse.json({
            user: result,
            message: 'Usuario creado exitosamente'
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error al crear usuario' },
            { status: 500 }
        );
    }
}
