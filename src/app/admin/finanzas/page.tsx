'use client';

import {
    DollarSign,
    TrendingUp,
    BarChart3,
    PieChart,
    Calendar,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const mockFinanceData = {
    totalRevenue: 5890000000,
    revenueChange: 18.5,
    platformFees: 353400000,
    pendingPayouts: 1512000000,
    monthlyRevenue: [
        { month: 'Jul', value: 280000000 },
        { month: 'Ago', value: 420000000 },
        { month: 'Sep', value: 380000000 },
        { month: 'Oct', value: 520000000 },
        { month: 'Nov', value: 680000000 },
        { month: 'Dic', value: 890000000 },
        { month: 'Ene', value: 720000000 },
    ],
    paymentMethods: [
        { name: 'MercadoPago', value: 52, color: 'bg-blue-500' },
        { name: 'Nequi', value: 31, color: 'bg-pink-500' },
        { name: 'PSE', value: 12, color: 'bg-green-500' },
        { name: 'Efectivo', value: 5, color: 'bg-yellow-500' },
    ],
    feeBreakdown: [
        { concept: 'Comisión plataforma', amount: 353400000, percentage: 6 },
        { concept: 'SAYCO', amount: 589000000, percentage: 10 },
        { concept: 'ACINPRO', amount: 235600000, percentage: 4 },
        { concept: 'IVA sobre comisiones', amount: 67146000, percentage: 19 },
    ]
};

export default function FinancePage() {
    const formatCurrency = (value: number) => {
        if (value >= 1000000000) {
            return `$${(value / 1000000000).toFixed(2)}B`;
        }
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(0)}M`;
        }
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const maxRevenue = Math.max(...mockFinanceData.monthlyRevenue.map(m => m.value));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Finanzas
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Overview financiero de la plataforma
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">
                        <option value="7d">Últimos 7 días</option>
                        <option value="30d" selected>Últimos 30 días</option>
                        <option value="90d">Últimos 90 días</option>
                        <option value="year">Este año</option>
                    </select>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-green-500 rounded-lg">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            {mockFinanceData.revenueChange}%
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(mockFinanceData.totalRevenue)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Ingresos totales</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-blue-500 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(mockFinanceData.platformFees)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Comisiones Eventu</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-yellow-500 rounded-lg">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(mockFinanceData.pendingPayouts)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Pendiente de pago</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-purple-500 rounded-lg">
                            <PieChart className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900">
                            6.0%
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Comisión promedio</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-12 gap-6">
                {/* Revenue Chart */}
                <div className="col-span-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-900">Ingresos mensuales</h3>
                            <p className="text-sm text-gray-500">Tendencia de los últimos 7 meses</p>
                        </div>
                    </div>

                    {/* Simple bar chart */}
                    <div className="flex items-end justify-between h-64 gap-4">
                        {mockFinanceData.monthlyRevenue.map((item, index) => {
                            const height = (item.value / maxRevenue) * 100;
                            return (
                                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex items-end justify-center h-52">
                                        <div
                                            className={cn(
                                                'w-12 rounded-t-lg transition-all hover:opacity-80',
                                                index === mockFinanceData.monthlyRevenue.length - 1
                                                    ? 'bg-[#E53935]'
                                                    : 'bg-gray-200'
                                            )}
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">{item.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Payment Methods Distribution */}
                <div className="col-span-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900">Métodos de pago</h3>
                        <p className="text-sm text-gray-500">Distribución de transacciones</p>
                    </div>

                    <div className="space-y-4">
                        {mockFinanceData.paymentMethods.map((method) => (
                            <div key={method.name}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-600">{method.name}</span>
                                    <span className="text-sm font-medium">{method.value}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn('h-full rounded-full', method.color)}
                                        style={{ width: `${method.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fee Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900">Desglose de retenciones</h3>
                    <p className="text-sm text-gray-500">Deducciones aplicadas a las liquidaciones</p>
                </div>

                <div className="grid grid-cols-4 gap-6">
                    {mockFinanceData.feeBreakdown.map((fee) => (
                        <div key={fee.concept} className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-500">{fee.concept}</p>
                            <p className="text-xl font-bold text-gray-900 mt-2">
                                {formatCurrency(fee.amount)}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                {fee.percentage}% sobre base
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
