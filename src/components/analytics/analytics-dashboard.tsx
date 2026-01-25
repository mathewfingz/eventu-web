'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Ticket,
    ShoppingCart,
    AlertCircle,
    RefreshCw,
    BarChart3,
    Target,
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';

interface AnalyticsDashboardProps {
    eventId: string;
    eventName: string;
}

interface DashboardData {
    metrics: {
        totalRevenue: number;
        revenueToday: number;
        totalTicketsSold: number;
        ticketsSoldToday: number;
        ticketsRemaining: number;
        occupancyRate: number;
        conversionRate: number;
        abandonmentRate: number;
        activeUsers: number;
        usersInCheckout: number;
    };
    salesByTicketType: { ticketType: string; sold: number; revenue: number }[];
    salesByHour: { timestamp: string; value: number }[];
    paymentMethods: { method: string; count: number; amount: number }[];
    conversionFunnel: {
        pageViews: number;
        ticketSelects: number;
        checkoutStarts: number;
        paymentInitiated: number;
        paymentSuccess: number;
    };
    prediction: {
        sellOutProbability: number;
        demandLevel: string;
        optimalPriceAdjustment: number;
    };
    insights: {
        summary: string;
        recommendation: string;
        alertLevel: 'green' | 'yellow' | 'red';
    };
}

export function AnalyticsDashboard({ eventId, eventName }: AnalyticsDashboardProps) {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/analytics/event/${eventId}`);
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [eventId]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-[#E53935]" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12 text-[#757575]">
                No hay datos disponibles
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#212121] font-[Poppins,sans-serif]">
                    {eventName}
                </h1>
                <button
                    onClick={handleRefresh}
                    className={cn(
                        'p-2 rounded-lg hover:bg-gray-100 transition-colors',
                        refreshing && 'animate-spin'
                    )}
                >
                    <RefreshCw className="w-5 h-5 text-[#757575]" />
                </button>
            </div>

            {/* AI Insights Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    'p-4 rounded-xl border',
                    data.insights.alertLevel === 'green' && 'bg-green-50 border-green-200',
                    data.insights.alertLevel === 'yellow' && 'bg-yellow-50 border-yellow-200',
                    data.insights.alertLevel === 'red' && 'bg-red-50 border-red-200'
                )}
            >
                <div className="flex items-start gap-4">
                    <div className={cn(
                        'p-2 rounded-lg',
                        data.insights.alertLevel === 'green' && 'bg-green-500',
                        data.insights.alertLevel === 'yellow' && 'bg-yellow-500',
                        data.insights.alertLevel === 'red' && 'bg-red-500'
                    )}>
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-[#212121]">{data.insights.summary}</p>
                        <p className="text-sm text-[#757575] mt-1">{data.insights.recommendation}</p>
                    </div>
                </div>
            </motion.div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Ingresos Totales"
                    value={formatPrice(data.metrics.totalRevenue)}
                    subValue={`+${formatPrice(data.metrics.revenueToday)} hoy`}
                    icon={DollarSign}
                    trend="up"
                />
                <MetricCard
                    title="Boletas Vendidas"
                    value={data.metrics.totalTicketsSold.toLocaleString()}
                    subValue={`+${data.metrics.ticketsSoldToday} hoy`}
                    icon={Ticket}
                    trend="up"
                />
                <MetricCard
                    title="Ocupación"
                    value={`${data.metrics.occupancyRate.toFixed(1)}%`}
                    subValue={`${data.metrics.ticketsRemaining.toLocaleString()} restantes`}
                    icon={BarChart3}
                    trend={data.metrics.occupancyRate > 70 ? 'up' : 'neutral'}
                />
                <MetricCard
                    title="Usuarios Activos"
                    value={data.metrics.activeUsers.toLocaleString()}
                    subValue={`${data.metrics.usersInCheckout} en checkout`}
                    icon={Users}
                    trend="neutral"
                    isLive
                />
            </div>

            {/* Sell Out Probability */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Probabilidad de Sold Out</h3>
                <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="none"
                                stroke="#E5E7EB"
                                strokeWidth="12"
                            />
                            <motion.circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="none"
                                stroke="#E53935"
                                strokeWidth="12"
                                strokeLinecap="round"
                                initial={{ strokeDasharray: '0 352' }}
                                animate={{
                                    strokeDasharray: `${(data.prediction.sellOutProbability / 100) * 352} 352`
                                }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{data.prediction.sellOutProbability}%</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-[#757575]">
                            Demanda: <span className="font-semibold capitalize">{data.prediction.demandLevel}</span>
                        </p>
                        {data.prediction.optimalPriceAdjustment !== 0 && (
                            <p className="text-sm mt-2">
                                💡 Sugerencia: {data.prediction.optimalPriceAdjustment > 0 ? 'Aumentar' : 'Reducir'} precios{' '}
                                <span className="font-semibold">{Math.abs(data.prediction.optimalPriceAdjustment)}%</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Conversion Funnel */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Embudo de Conversión</h3>
                    <div className="space-y-3">
                        <FunnelStep
                            label="Vistas de página"
                            value={data.conversionFunnel.pageViews}
                            percentage={100}
                        />
                        <FunnelStep
                            label="Selección de boletas"
                            value={data.conversionFunnel.ticketSelects}
                            percentage={(data.conversionFunnel.ticketSelects / data.conversionFunnel.pageViews) * 100}
                        />
                        <FunnelStep
                            label="Inicio de checkout"
                            value={data.conversionFunnel.checkoutStarts}
                            percentage={(data.conversionFunnel.checkoutStarts / data.conversionFunnel.pageViews) * 100}
                        />
                        <FunnelStep
                            label="Pago iniciado"
                            value={data.conversionFunnel.paymentInitiated}
                            percentage={(data.conversionFunnel.paymentInitiated / data.conversionFunnel.pageViews) * 100}
                        />
                        <FunnelStep
                            label="Pago exitoso"
                            value={data.conversionFunnel.paymentSuccess}
                            percentage={(data.conversionFunnel.paymentSuccess / data.conversionFunnel.pageViews) * 100}
                            isLast
                        />
                    </div>
                </div>

                {/* Sales by Ticket Type */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Ventas por Tipo de Boleta</h3>
                    <div className="space-y-4">
                        {data.salesByTicketType.map((type, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="font-medium">{type.ticketType}</p>
                                    <p className="text-sm text-[#757575]">{type.sold} vendidas</p>
                                </div>
                                <p className="font-semibold">{formatPrice(type.revenue)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Métodos de Pago</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.paymentMethods.map((method, index) => (
                        <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-[#757575] mb-1">{method.method}</p>
                            <p className="text-xl font-bold">{method.count}</p>
                            <p className="text-sm text-[#757575]">{formatPrice(method.amount)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Helper Components

function MetricCard({
    title,
    value,
    subValue,
    icon: Icon,
    trend,
    isLive,
}: {
    title: string;
    value: string;
    subValue: string;
    icon: any;
    trend: 'up' | 'down' | 'neutral';
    isLive?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#757575]">{title}</span>
                <div className={cn(
                    'p-2 rounded-lg',
                    trend === 'up' && 'bg-green-100 text-green-600',
                    trend === 'down' && 'bg-red-100 text-red-600',
                    trend === 'neutral' && 'bg-gray-100 text-gray-600'
                )}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{value}</p>
                {isLive && (
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                )}
            </div>

            <p className="text-sm text-[#757575] mt-1 flex items-center gap-1">
                {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                {subValue}
            </p>
        </motion.div>
    );
}

function FunnelStep({
    label,
    value,
    percentage,
    isLast,
}: {
    label: string;
    value: number;
    percentage: number;
    isLast?: boolean;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[#757575]">{label}</span>
                <span className="text-sm font-medium">{value.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className={cn(
                        'h-full rounded-full',
                        isLast ? 'bg-green-500' : 'bg-[#E53935]'
                    )}
                />
            </div>
            {!isLast && (
                <div className="flex justify-center my-1">
                    <div className="w-0.5 h-2 bg-gray-200" />
                </div>
            )}
        </div>
    );
}
