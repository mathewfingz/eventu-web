import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/reports - Get report data with aggregations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // month, quarter, year, all
    const reportType = searchParams.get('type'); // daily_sales, sayco, taxes

    // Calculate date range based on period
    const now = new Date();
    let dateFrom: Date;

    switch (period) {
      case 'month':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        dateFrom = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        dateFrom = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        dateFrom = new Date(0); // All time
    }

    // If specific report type is requested
    if (reportType === 'daily_sales') {
      return getDailySalesReport(dateFrom, now);
    }

    if (reportType === 'sayco') {
      return getSaycoReport(dateFrom, now);
    }

    if (reportType === 'taxes') {
      return getTaxesReport(dateFrom, now);
    }

    // General report data
    const dateFilter = period !== 'all' ? { createdAt: { gte: dateFrom } } : {};

    // Get summary stats
    const [
      ordersStats,
      ticketsSold,
      eventsCount,
      usersCount,
      topEvents,
      topPromoters,
    ] = await Promise.all([
      // Orders and revenue stats
      prisma.order.aggregate({
        where: {
          ...dateFilter,
          status: { in: ['COMPLETED', 'CONFIRMED'] },
        },
        _sum: {
          total: true,
        },
        _count: {
          _all: true,
        },
        _avg: {
          total: true,
        },
      }),

      // Total tickets sold
      prisma.orderItem.aggregate({
        where: {
          order: {
            ...dateFilter,
            status: { in: ['COMPLETED', 'CONFIRMED'] },
          },
        },
        _sum: {
          quantity: true,
        },
      }),

      // Active events count
      prisma.event.count({
        where: {
          ...dateFilter,
          status: { in: ['PUBLISHED', 'COMPLETED'] },
        },
      }),

      // Users count
      prisma.user.count({
        where: dateFilter,
      }),

      // Top events by revenue
      prisma.event.findMany({
        where: {
          orders: {
            some: {
              ...dateFilter,
              status: { in: ['COMPLETED', 'CONFIRMED'] },
            },
          },
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              orders: {
                where: {
                  status: { in: ['COMPLETED', 'CONFIRMED'] },
                },
              },
            },
          },
          orders: {
            where: {
              status: { in: ['COMPLETED', 'CONFIRMED'] },
            },
            select: {
              total: true,
              items: {
                select: {
                  quantity: true,
                },
              },
            },
          },
        },
        take: 5,
      }),

      // Top promoters
      prisma.user.findMany({
        where: {
          role: 'PROMOTER',
          events: {
            some: {
              orders: {
                some: {
                  ...dateFilter,
                  status: { in: ['COMPLETED', 'CONFIRMED'] },
                },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          businessName: true,
          _count: {
            select: {
              events: true,
            },
          },
          events: {
            select: {
              orders: {
                where: {
                  status: { in: ['COMPLETED', 'CONFIRMED'] },
                },
                select: {
                  total: true,
                },
              },
            },
          },
        },
        take: 5,
      }),
    ]);

    // Calculate conversion rate (orders / visits - we'll use a mock ratio for now)
    const totalOrders = ordersStats._count._all;
    const estimatedVisits = totalOrders * 25; // Assuming ~4% conversion rate
    const conversionRate = totalOrders > 0 ? ((totalOrders / estimatedVisits) * 100).toFixed(1) : '0';

    // Format top events
    const formattedTopEvents = topEvents
      .map((event) => {
        const revenue = event.orders.reduce((sum, order) => sum + order.total, 0);
        const tickets = event.orders.reduce(
          (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0),
          0
        );
        return {
          id: event.id,
          name: event.name,
          revenue,
          tickets,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    // Format top promoters
    const formattedTopPromoters = topPromoters
      .map((promoter) => {
        const revenue = promoter.events.reduce(
          (sum, event) => sum + event.orders.reduce((s, order) => s + order.total, 0),
          0
        );
        return {
          id: promoter.id,
          name: promoter.businessName || promoter.name || 'Sin nombre',
          events: promoter._count.events,
          revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      summary: {
        totalRevenue: ordersStats._sum.total || 0,
        totalTickets: ticketsSold._sum.quantity || 0,
        totalEvents: eventsCount,
        totalUsers: usersCount,
        avgOrderValue: ordersStats._avg.total || 0,
        conversionRate: parseFloat(conversionRate),
        totalOrders,
      },
      topEvents: formattedTopEvents,
      topPromoters: formattedTopPromoters,
      period,
      dateRange: {
        from: dateFrom.toISOString(),
        to: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Error al obtener los reportes' },
      { status: 500 }
    );
  }
}

// Helper function for daily sales report
async function getDailySalesReport(dateFrom: Date, dateTo: Date) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
        status: { in: ['COMPLETED', 'CONFIRMED'] },
      },
      select: {
        createdAt: true,
        total: true,
        items: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by day
    const dailyData: Record<string, { date: string; revenue: number; orders: number; tickets: number }> = {};

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          revenue: 0,
          orders: 0,
          tickets: 0,
        };
      }
      dailyData[dateKey].revenue += order.total;
      dailyData[dateKey].orders += 1;
      dailyData[dateKey].tickets += order.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    return NextResponse.json({
      type: 'daily_sales',
      data: Object.values(dailyData),
    });
  } catch (error) {
    console.error('Error generating daily sales report:', error);
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    );
  }
}

// Helper function for SAYCO/ACINPRO report
async function getSaycoReport(dateFrom: Date, dateTo: Date) {
  try {
    // Get events with music-related categories for SAYCO/ACINPRO
    const events = await prisma.event.findMany({
      where: {
        orders: {
          some: {
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
            status: { in: ['COMPLETED', 'CONFIRMED'] },
          },
        },
      },
      select: {
        id: true,
        name: true,
        date: true,
        venue: {
          select: {
            name: true,
            city: true,
          },
        },
        orders: {
          where: {
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
            status: { in: ['COMPLETED', 'CONFIRMED'] },
          },
          select: {
            total: true,
            items: {
              select: {
                quantity: true,
              },
            },
          },
        },
      },
    });

    // Calculate SAYCO (2.5%) and ACINPRO (2%) fees
    const saycoRate = 0.025;
    const acinproRate = 0.02;

    const reportData = events.map((event) => {
      const totalRevenue = event.orders.reduce((sum, order) => sum + order.total, 0);
      const totalAttendees = event.orders.reduce(
        (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0),
        0
      );

      return {
        eventName: event.name,
        eventDate: event.date,
        venueName: event.venue?.name || 'N/A',
        city: event.venue?.city || 'N/A',
        attendees: totalAttendees,
        revenue: totalRevenue,
        saycoFee: totalRevenue * saycoRate,
        acinproFee: totalRevenue * acinproRate,
        totalRoyalties: totalRevenue * (saycoRate + acinproRate),
      };
    });

    const totals = reportData.reduce(
      (acc, event) => ({
        revenue: acc.revenue + event.revenue,
        saycoFee: acc.saycoFee + event.saycoFee,
        acinproFee: acc.acinproFee + event.acinproFee,
        totalRoyalties: acc.totalRoyalties + event.totalRoyalties,
        attendees: acc.attendees + event.attendees,
      }),
      { revenue: 0, saycoFee: 0, acinproFee: 0, totalRoyalties: 0, attendees: 0 }
    );

    return NextResponse.json({
      type: 'sayco',
      data: reportData,
      totals,
      rates: {
        sayco: saycoRate,
        acinpro: acinproRate,
      },
    });
  } catch (error) {
    console.error('Error generating SAYCO report:', error);
    return NextResponse.json(
      { error: 'Error al generar el reporte SAYCO/ACINPRO' },
      { status: 500 }
    );
  }
}

// Helper function for taxes report
async function getTaxesReport(dateFrom: Date, dateTo: Date) {
  try {
    // Get all taxes
    const taxes = await prisma.tax.findMany({
      where: { isActive: true },
    });

    // Get orders with tax breakdown
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
        status: { in: ['COMPLETED', 'CONFIRMED'] },
      },
      select: {
        total: true,
        subtotal: true,
        taxAmount: true,
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalSubtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);
    const totalTaxes = orders.reduce((sum, order) => sum + (order.taxAmount || 0), 0);

    // Calculate tax breakdown by type
    const taxBreakdown = taxes.map((tax) => ({
      name: tax.name,
      code: tax.code,
      rate: tax.percentage,
      // Estimated amount based on percentage share
      amount: totalTaxes * (tax.percentage / taxes.reduce((sum, t) => sum + t.percentage, 0) || 1),
    }));

    return NextResponse.json({
      type: 'taxes',
      data: {
        totalRevenue,
        totalSubtotal,
        totalTaxes,
        taxBreakdown,
        ordersCount: orders.length,
      },
      taxes: taxes.map((t) => ({
        name: t.name,
        code: t.code,
        percentage: t.percentage,
      })),
    });
  } catch (error) {
    console.error('Error generating taxes report:', error);
    return NextResponse.json(
      { error: 'Error al generar el reporte de impuestos' },
      { status: 500 }
    );
  }
}
