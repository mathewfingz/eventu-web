'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
    FileText,
    Download,
    Calendar,
    DollarSign,
    Ticket,
    Users,
    CreditCard,
    TrendingUp,
    Loader2,
    CheckCircle,
    BarChart3,
    PieChart
} from 'lucide-react';

// Mock data
const mockSummary = {
    totalRevenue: 45600000,
    totalOrders: 1234,
    totalTickets: 1500,
    avgOrderValue: 36971,
    conversionRate: 12.5
};

const mockTicketTypeStats = [
    { name: 'VIP', sold: 120, total: 150, revenue: 42000000, percentage: 80 },
    { name: 'General', sold: 380, total: 500, revenue: 30400000, percentage: 76 },
    { name: 'Platino', sold: 85, total: 100, revenue: 21250000, percentage: 85 }
];

const mockPaymentMethods = [
    { method: 'Tarjeta de credito', orders: 567, amount: 23400000, percentage: 46 },
    { method: 'Nequi', orders: 312, amount: 12000000, percentage: 25 },
    { method: 'PSE', orders: 234, amount: 8200000, percentage: 19 },
    { method: 'Daviplata', orders: 89, amount: 1500000, percentage: 7 },
    { method: 'Efecty', orders: 32, amount: 500000, percentage: 3 }
];

const mockDailySales = [
    { date: '2026-01-15', orders: 45, revenue: 1800000 },
    { date: '2026-01-16', orders: 89, revenue: 3600000 },
    { date: '2026-01-17', orders: 156, revenue: 6200000 },
    { date: '2026-01-18', orders: 234, revenue: 9400000 },
    { date: '2026-01-19', orders: 312, revenue: 12500000 },
    { date: '2026-01-20', orders: 198, revenue: 8000000 },
    { date: '2026-01-21', orders: 200, revenue: 4100000 }
];

const reportTypes = [
    {
        id: 'sales',
        name: 'Reporte de Ventas',
        description: 'Detalle de todas las ordenes y transacciones',
        icon: DollarSign,
        color: 'bg-green-100 text-green-600'
    },
    {
        id: 'tickets',
        name: 'Reporte de Boletas',
        description: 'Inventario y estado de cada tipo de boleta',
        icon: Ticket,
        color: 'bg-blue-100 text-blue-600'
    },
    {
        id: 'validation',
        name: 'Reporte de Validaciones',
        description: 'Registro de entradas y validaciones',
        icon: Users,
        color: 'bg-purple-100 text-purple-600'
    },
    {
        id: 'payments',
        name: 'Reporte de Pagos',
        description: 'Desglose por metodo de pago',
        icon: CreditCard,
        color: 'bg-orange-100 text-orange-600'
    }
];

export default function EventReportsPage() {
    const params = useParams();
    const eventId = params?.eventId as string;

    const [exportingReport, setExportingReport] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState('all');

    const handleExport = async (reportId: string, format: 'pdf' | 'csv') => {
        setExportingReport(reportId);
        // Simulate export
        await new Promise(resolve => setTimeout(resolve, 2000));
        setExportingReport(null);
        // In real implementation, this would trigger a download
    };

    const maxRevenue = Math.max(...mockDailySales.map(d => d.revenue));

    return (
        <div className="p-6 bg-gray-100 min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
                    <p className="text-gray-600">
                        Genera y exporta informes del evento
                    </p>
                </div>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] bg-white"
                >
                    <option value="today">Hoy</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Este mes</option>
                    <option value="all">Todo el periodo</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-500">Ingresos</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        ${(mockSummary.totalRevenue / 1000000).toFixed(1)}M
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-gray-500">Ordenes</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        {mockSummary.totalOrders.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Ticket className="w-4 h-4 text-purple-500" />
                        <span className="text-xs text-gray-500">Boletas</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        {mockSummary.totalTickets.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-gray-500">Ticket Promedio</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        ${mockSummary.avgOrderValue.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-cyan-500" />
                        <span className="text-xs text-gray-500">Conversion</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        {mockSummary.conversionRate}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Sales Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Ventas Diarias</h3>
                    <div className="space-y-3">
                        {mockDailySales.map((day) => (
                            <div key={day.date} className="flex items-center gap-3">
                                <span className="w-20 text-sm text-gray-600">
                                    {new Date(day.date).toLocaleDateString('es-CO', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </span>
                                <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                                    <div
                                        className="h-full bg-[#E53935] rounded"
                                        style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                                    />
                                </div>
                                <span className="w-20 text-sm font-medium text-gray-900 text-right">
                                    ${(day.revenue / 1000000).toFixed(1)}M
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Metodos de Pago</h3>
                    <div className="space-y-3">
                        {mockPaymentMethods.map((pm) => (
                            <div key={pm.method} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{pm.method}</p>
                                        <p className="text-xs text-gray-500">{pm.orders} ordenes</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        ${(pm.amount / 1000000).toFixed(1)}M
                                    </p>
                                    <p className="text-xs text-gray-500">{pm.percentage}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ticket Types Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Rendimiento por Tipo de Boleta</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-3 text-sm font-medium text-gray-600">Tipo</th>
                                <th className="text-right py-3 text-sm font-medium text-gray-600">Vendidas</th>
                                <th className="text-right py-3 text-sm font-medium text-gray-600">Disponibles</th>
                                <th className="text-right py-3 text-sm font-medium text-gray-600">% Vendido</th>
                                <th className="text-right py-3 text-sm font-medium text-gray-600">Ingresos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockTicketTypeStats.map((tt) => (
                                <tr key={tt.name}>
                                    <td className="py-3">
                                        <span className="font-medium text-gray-900">{tt.name}</span>
                                    </td>
                                    <td className="py-3 text-right text-gray-900">{tt.sold}</td>
                                    <td className="py-3 text-right text-gray-500">{tt.total - tt.sold}</td>
                                    <td className="py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#E53935] rounded-full"
                                                    style={{ width: `${tt.percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-gray-900">{tt.percentage}%</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-right font-medium text-green-600">
                                        ${(tt.revenue / 1000000).toFixed(1)}M
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Exportar Reportes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportTypes.map((report) => {
                        const Icon = report.icon;
                        const isExporting = exportingReport === report.id;

                        return (
                            <div
                                key={report.id}
                                className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{report.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button
                                                onClick={() => handleExport(report.id, 'pdf')}
                                                disabled={isExporting}
                                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {isExporting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Download className="w-4 h-4" />
                                                )}
                                                PDF
                                            </button>
                                            <button
                                                onClick={() => handleExport(report.id, 'csv')}
                                                disabled={isExporting}
                                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {isExporting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Download className="w-4 h-4" />
                                                )}
                                                CSV
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
