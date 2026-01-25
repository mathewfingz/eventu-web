import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Check if user has coordinator permissions
    const allowedRoles = ['SUPERADMIN', 'COORDINATOR', 'PROMOTER'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta funcionalidad' },
        { status: 403 }
      );
    }

    let events;

    // SUPERADMIN sees all events
    if (user.role === 'SUPERADMIN') {
      events = await prisma.event.findMany({
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true
            }
          },
          ticketTypes: {
            select: {
              id: true,
              name: true,
              totalQuantity: true,
              soldQuantity: true,
              price: true
            }
          },
          _count: {
            select: {
              orders: true
            }
          }
        },
        orderBy: { date: 'asc' }
      });

      // Add full permissions for SUPERADMIN
      events = events.map(event => ({
        ...event,
        permissions: {
          canViewOrders: true,
          canEditPresales: true,
          canEditMap: true,
          canUploadImages: true,
          canEditTicketTypes: true,
          canEditEvent: true,
          canViewReports: true,
          canScan: true
        }
      }));
    }
    // PROMOTER sees their own events
    else if (user.role === 'PROMOTER') {
      events = await prisma.event.findMany({
        where: {
          promoterId: user.id
        },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true
            }
          },
          ticketTypes: {
            select: {
              id: true,
              name: true,
              totalQuantity: true,
              soldQuantity: true,
              price: true
            }
          },
          _count: {
            select: {
              orders: true
            }
          }
        },
        orderBy: { date: 'asc' }
      });

      // Promoters have full permissions on their events
      events = events.map(event => ({
        ...event,
        permissions: {
          canViewOrders: true,
          canEditPresales: true,
          canEditMap: true,
          canUploadImages: true,
          canEditTicketTypes: true,
          canEditEvent: true,
          canViewReports: true,
          canScan: true
        }
      }));
    }
    // COORDINATOR sees assigned events
    else {
      const assignments = await prisma.coordinatorAssignment.findMany({
        where: {
          coordinatorId: user.id,
          isActive: true
        },
        include: {
          event: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true
                }
              },
              ticketTypes: {
                select: {
                  id: true,
                  name: true,
                  totalQuantity: true,
                  soldQuantity: true,
                  price: true
                }
              },
              _count: {
                select: {
                  orders: true
                }
              }
            }
          }
        }
      });

      events = assignments.map(assignment => ({
        ...assignment.event,
        permissions: {
          canViewOrders: assignment.canViewOrders,
          canEditPresales: assignment.canEditPresales,
          canEditMap: assignment.canEditMap,
          canUploadImages: assignment.canUploadImages,
          canEditTicketTypes: assignment.canEditTicketTypes,
          canEditEvent: assignment.canEditEvent,
          canViewReports: assignment.canViewReports,
          canScan: assignment.canScan
        }
      }));
    }

    // Format response
    const formattedEvents = events.map((event: any) => ({
      id: event.id,
      name: event.name,
      slug: event.slug,
      description: event.description,
      date: event.date?.toISOString?.() || event.date,
      doorsOpenAt: event.doorsOpenAt?.toISOString?.() || event.doorsOpenAt || null,
      status: event.status,
      category: event.category,
      imageUrl: event.imageUrl,
      coverUrl: event.coverUrl,
      priceFrom: event.priceFrom,
      priceTo: event.priceTo,
      venue: event.venue ? {
        id: event.venue.id,
        name: event.venue.name,
        address: event.venue.address,
        city: event.venue.city
      } : null,
      ticketTypes: event.ticketTypes?.map((tt: any) => ({
        id: tt.id,
        name: tt.name,
        totalQuantity: tt.totalQuantity,
        soldQuantity: tt.soldQuantity,
        price: tt.price
      })) || [],
      totalCapacity: event.ticketTypes?.reduce((sum: number, tt: any) => sum + (tt.totalQuantity || 0), 0) || 0,
      ticketsSold: event.ticketTypes?.reduce((sum: number, tt: any) => sum + (tt.soldQuantity || 0), 0) || 0,
      ordersCount: event._count?.orders || 0,
      permissions: event.permissions
    }));

    return NextResponse.json({
      events: formattedEvents,
      total: formattedEvents.length
    });

  } catch (error) {
    console.error('Error fetching coordinator events:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
