import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyCoordinatorAccess } from '@/lib/coordinator-auth';

export const dynamic = 'force-dynamic';

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

    // Verify coordinator access with canViewReports permission
    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canViewReports');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para ver los reportes' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const format = searchParams.get('format') || 'json'; // json, csv

    // Get event data
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venue: true,
        ticketTypes: true
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    let reportData: any = {};

    switch (reportType) {
      case 'summary':
        reportData = await generateSummaryReport(eventId, event);
        break;
      case 'sales':
        reportData = await generateSalesReport(eventId);
        break;
      case 'validation':
        reportData = await generateValidationReport(eventId);
        break;
      case 'presales':
        reportData = await generatePresalesReport(eventId);
        break;
      case 'attendees':
        reportData = await generateAttendeesReport(eventId);
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de reporte invalido' },
          { status: 400 }
        );
    }

    // If CSV format requested, convert to CSV
    if (format === 'csv' && reportData.data) {
      const csv = convertToCSV(reportData.data);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}-${eventId}.csv"`
        }
      });
    }

    return NextResponse.json({
      report: reportData,
      event: {
        id: event.id,
        name: event.name,
        date: event.date.toISOString(),
        venue: event.venue?.name || 'N/A'
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function generateSummaryReport(eventId: string, event: any) {
  // Get orders stats
  const orderStats = await prisma.order.groupBy({
    by: ['status'],
    where: { eventId },
    _count: true,
    _sum: { total: true }
  });

  // Get ticket stats
  const ticketStats = await prisma.ticket.groupBy({
    by: ['status'],
    where: { order: { eventId } },
    _count: true
  });

  // Calculate totals
  const totalRevenue = orderStats
    .filter(s => s.status === 'PAID')
    .reduce((sum, s) => sum + (s._sum.total || 0), 0);

  const totalOrders = orderStats.reduce((sum, s) => sum + s._count, 0);
  const paidOrders = orderStats.find(s => s.status === 'PAID')?._count || 0;

  const totalCapacity = event.ticketTypes.reduce((sum: number, tt: any) => sum + tt.totalQuantity, 0);
  const ticketsSold = event.ticketTypes.reduce((sum: number, tt: any) => sum + tt.soldQuantity, 0);

  const validatedTickets = ticketStats.find(s => s.status === 'USED')?._count || 0;
  const activeTickets = ticketStats.find(s => s.status === 'ACTIVE')?._count || 0;

  // Get sales by ticket type
  const salesByType = event.ticketTypes.map((tt: any) => ({
    name: tt.name,
    price: tt.price,
    totalQuantity: tt.totalQuantity,
    soldQuantity: tt.soldQuantity,
    availableQuantity: tt.totalQuantity - tt.soldQuantity,
    revenue: tt.soldQuantity * tt.price,
    soldPercentage: tt.totalQuantity > 0 ? Math.round((tt.soldQuantity / tt.totalQuantity) * 100) : 0
  }));

  return {
    type: 'summary',
    overview: {
      totalCapacity,
      ticketsSold,
      ticketsAvailable: totalCapacity - ticketsSold,
      occupancyRate: totalCapacity > 0 ? Math.round((ticketsSold / totalCapacity) * 100) : 0,
      totalRevenue,
      averageTicketPrice: ticketsSold > 0 ? Math.round(totalRevenue / ticketsSold) : 0
    },
    orders: {
      total: totalOrders,
      paid: paidOrders,
      pending: orderStats.find(s => s.status === 'PENDING')?._count || 0,
      cancelled: orderStats.find(s => s.status === 'CANCELLED')?._count || 0,
      conversionRate: totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0
    },
    validation: {
      validated: validatedTickets,
      pending: activeTickets,
      validationRate: ticketsSold > 0 ? Math.round((validatedTickets / ticketsSold) * 100) : 0
    },
    salesByType
  };
}

async function generateSalesReport(eventId: string) {
  // Get orders with details
  const orders = await prisma.order.findMany({
    where: { eventId, status: 'PAID' },
    include: {
      user: {
        select: { name: true, email: true }
      },
      items: {
        include: {
          ticketType: {
            select: { name: true, price: true }
          }
        }
      }
    },
    orderBy: { paidAt: 'desc' }
  });

  // Get daily sales
  const dailySales = await prisma.order.groupBy({
    by: ['createdAt'],
    where: { eventId, status: 'PAID' },
    _count: true,
    _sum: { total: true }
  });

  // Get sales by payment method
  const salesByMethod = await prisma.order.groupBy({
    by: ['paymentMethod'],
    where: { eventId, status: 'PAID' },
    _count: true,
    _sum: { total: true }
  });

  return {
    type: 'sales',
    totalSales: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    averageOrderValue: orders.length > 0
      ? Math.round(orders.reduce((sum, o) => sum + o.total, 0) / orders.length)
      : 0,
    salesByPaymentMethod: salesByMethod.map(s => ({
      method: s.paymentMethod || 'N/A',
      count: s._count,
      total: s._sum.total || 0
    })),
    data: orders.map(o => ({
      orderNumber: o.orderNumber,
      customer: o.user.name || o.user.email,
      email: o.user.email,
      items: o.items.map(i => `${i.quantity}x ${i.ticketType.name}`).join(', '),
      total: o.total,
      paymentMethod: o.paymentMethod,
      paidAt: o.paidAt?.toISOString() || ''
    }))
  };
}

async function generateValidationReport(eventId: string) {
  // Get validation stats by hour
  const validations = await prisma.ticket.findMany({
    where: {
      order: { eventId },
      status: 'USED'
    },
    select: {
      usedAt: true,
      usedByDevice: true,
      section: true,
      seatRow: true,
      seatNumber: true
    }
  });

  // Group by hour
  const byHour: Record<string, number> = {};
  const byDevice: Record<string, number> = {};
  const bySection: Record<string, number> = {};

  validations.forEach(v => {
    if (v.usedAt) {
      const hour = v.usedAt.toISOString().slice(0, 13);
      byHour[hour] = (byHour[hour] || 0) + 1;
    }
    if (v.usedByDevice) {
      byDevice[v.usedByDevice] = (byDevice[v.usedByDevice] || 0) + 1;
    }
    if (v.section) {
      bySection[v.section] = (bySection[v.section] || 0) + 1;
    }
  });

  return {
    type: 'validation',
    totalValidated: validations.length,
    byHour: Object.entries(byHour).map(([hour, count]) => ({ hour, count })).sort((a, b) => a.hour.localeCompare(b.hour)),
    byDevice: Object.entries(byDevice).map(([device, count]) => ({ device, count })),
    bySection: Object.entries(bySection).map(([section, count]) => ({ section, count })),
    data: validations.map(v => ({
      validatedAt: v.usedAt?.toISOString() || '',
      device: v.usedByDevice || 'N/A',
      section: v.section || 'General',
      seat: v.seatRow && v.seatNumber ? `${v.seatRow}-${v.seatNumber}` : 'N/A'
    }))
  };
}

async function generatePresalesReport(eventId: string) {
  const presales = await prisma.presale.findMany({
    where: { eventId },
    include: {
      codes: {
        include: {
          _count: {
            select: { usages: true }
          }
        }
      },
      _count: {
        select: { orders: true }
      }
    }
  });

  return {
    type: 'presales',
    totalPresales: presales.length,
    data: presales.map(p => ({
      name: p.name,
      type: p.type,
      status: p.status,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      totalCodes: p.codes.length,
      usedCodes: p.codes.filter(c => c._count.usages > 0).length,
      ordersGenerated: p._count.orders,
      totalAllocation: p.totalAllocation || 'Unlimited',
      usedAllocation: p.usedAllocation
    }))
  };
}

async function generateAttendeesReport(eventId: string) {
  const tickets = await prisma.ticket.findMany({
    where: {
      order: { eventId, status: 'PAID' }
    },
    include: {
      user: {
        select: { name: true, email: true, phone: true }
      },
      ticketType: {
        select: { name: true }
      }
    }
  });

  return {
    type: 'attendees',
    totalAttendees: tickets.length,
    data: tickets.map(t => ({
      name: t.user.name || 'N/A',
      email: t.user.email,
      phone: t.user.phone || 'N/A',
      ticketType: t.ticketType.name,
      section: t.section || 'General',
      seat: t.seatRow && t.seatNumber ? `${t.seatRow}-${t.seatNumber}` : 'N/A',
      status: t.status,
      validatedAt: t.usedAt?.toISOString() || ''
    }))
  };
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const value = row[h];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
