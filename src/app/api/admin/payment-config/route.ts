import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/payment-config - Get all payment provider configurations
export async function GET() {
  try {
    const configs = await prisma.paymentProviderConfig.findMany({
      orderBy: { provider: 'asc' },
    });

    // Get transaction stats for each provider (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const providerStats = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { _all: true },
      _sum: { amount: true },
    });

    // Calculate success rates
    const successStats = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: 'COMPLETED',
      },
      _count: { _all: true },
    });

    // Map stats to providers
    const providers = ['NEQUI', 'MERCADOPAGO', 'COBRU'];
    const formattedConfigs = providers.map((provider) => {
      const config = configs.find((c) => c.provider === provider);
      const stats = providerStats.find((s) => s.paymentMethod === provider);
      const successCount = successStats.find((s) => s.paymentMethod === provider)?._count._all || 0;
      const totalCount = stats?._count._all || 0;
      const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '0';

      return {
        id: config?.id || provider,
        provider,
        name: provider === 'NEQUI' ? 'Nequi' : provider === 'MERCADOPAGO' ? 'MercadoPago' : 'Cobru',
        isEnabled: config?.isEnabled || false,
        isTestMode: config?.isTestMode ?? true,
        status: config?.testStatus || 'pending',
        lastTestedAt: config?.lastTestedAt,
        stats: {
          transactions: totalCount,
          volume: stats?._sum.amount || 0,
          successRate: parseFloat(successRate),
        },
      };
    });

    return NextResponse.json({ providers: formattedConfigs });
  } catch (error) {
    console.error('Error fetching payment configs:', error);
    return NextResponse.json(
      { error: 'Error al obtener las configuraciones' },
      { status: 500 }
    );
  }
}
