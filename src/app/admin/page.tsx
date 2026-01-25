'use client';

import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Ticket,
    Users,
    Calendar,
    MoreHorizontal,
    ArrowUpRight,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for development
const mockStats = {
    totalSales: 245680000,
    salesChange: 12.5,
    ticketsSold: 8234,
    ticketsChange: 8.3,
    newUsers: 1456,
    usersChange: -2.1,
    activeEvents: 47,
    eventsChange: 15.2
};

const mockRecentOrders = [
    { id: '1', user: 'Carlos Rodríguez', event: 'Bad Bunny - World Tour', amount: 450000, status: 'completed', time: '2 min ago' },
    { id: '2', user: 'María García', event: 'Festival Estéreo Picnic', amount: 780000, status: 'completed', time: '5 min ago' },
    { id: '3', user: 'Juan López', event: 'Shakira Live', amount: 350000, status: 'pending', time: '8 min ago' },
    { id: '4', user: 'Ana Martínez', event: 'Coldplay', amount: 520000, status: 'completed', time: '12 min ago' },
    { id: '5', user: 'Pedro Sánchez', event: 'Karol G', amount: 285000, status: 'failed', time: '15 min ago' },
];

const mockTopEvents = [
    { id: '1', name: 'Bad Bunny - World Tour', sold: 2340, revenue: 87500000, progress: 92 },
    { id: '2', name: 'Festival Estéreo Picnic', sold: 1850, revenue: 65200000, progress: 78 },
    { id: '3', name: 'Shakira Live', sold: 1620, revenue: 52800000, progress: 65 },
    { id: '4', name: 'Coldplay', sold: 980, revenue: 38500000, progress: 45 },
];

const mockPendingApprovals = [
    { id: '1', name: 'Concierto Reggaeton Night', promoter: 'EventosCO', date: '2026-02-15' },
    { id: '2', name: 'Festival de Salsa', promoter: 'SalsaViva', date: '2026-03-01' },
    { id: '3', name: 'Comedy Night', promoter: 'RisasColombia', date: '2026-01-28' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default function AdminDashboard() {
    const stats = mockStats;

    const cards = [
        {
            title: 'Ventas Totales',
            value: formatCurrency(stats.totalSales),
            change: stats.salesChange,
            changeLabel: 'vs. ayer',
            icon: DollarSign,
            color: 'bg-green-500'
        },
        {
            title: 'Boletas Vendidas',
            value: stats.ticketsSold.toLocaleString(),
            change: stats.ticketsChange,
            changeLabel: 'vs. ayer',
            icon: Ticket,
            color: 'bg-blue-500'
        },
        {
            title: 'Usuarios Nuevos',
            value: stats.newUsers.toLocaleString(),
            change: stats.usersChange,
            changeLabel: 'vs. ayer',
            icon: Users,
            color: 'bg-purple-500'
        },
        {
            title: 'Eventos Activos',
            value: stats.activeEvents.toLocaleString(),
            change: stats.eventsChange,
            changeLabel: 'vs. semana pasada',
            icon: Calendar,
            color: 'bg-orange-500'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Bienvenido de vuelta. Aquí está el resumen de hoy.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20">
                        <option value="today">Hoy</option>
                        <option value="week">Esta semana</option>
                        <option value="month">Este mes</option>
                        <option value="year">Este año</option>
                    </select>

                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                        Exportar reporte
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    const isPositive = card.change >= 0;

                    return (
                        <div
                            key={card.title}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center justify-between">
                                <div className={cn('p-3 rounded-lg', card.color)}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>

                                <div className={cn(
                                    'flex items-center gap-1 text-sm font-medium',
                                    isPositive ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {isPositive ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    <span>{Math.abs(card.change)}%</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {card.title}
                                    <span className="text-gray-400 ml-1">({card.changeLabel})</span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Top Events - 8 columns */}
                <div className="col-span-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-900">Top Eventos</h3>
                            <p className="text-sm text-gray-500">Eventos con más ventas</p>
                        </div>
                        <button className="text-sm text-[#E53935] font-medium hover:underline">
                            Ver todos
                        </button>
                    </div>

                    <div className="space-y-4">
                        {mockTopEvents.map((event, index) => (
                            <div key={event.id} className="flex items-center gap-4">
                                <span className="text-lg font-bold text-gray-300 w-6">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium text-gray-900">{event.name}</p>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(event.revenue)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#E53935] rounded-full transition-all"
                                                style={{ width: `${event.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {event.sold.toLocaleString()} vendidas
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Approvals - 4 columns */}
                <div className="col-span-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-900">Pendientes</h3>
                            <p className="text-sm text-gray-500">Eventos por aprobar</p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            {mockPendingApprovals.length}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {mockPendingApprovals.map((event) => (
                            <div
                                key={event.id}
                                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">
                                            {event.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {event.promoter}
                                        </p>
                                    </div>
                                    <button className="p-1 hover:bg-gray-200 rounded">
                                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                        {new Date(event.date).toLocaleDateString('es-CO', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 py-2 text-sm text-[#E53935] font-medium hover:bg-red-50 rounded-lg transition-colors">
                        Ver todos los pendientes
                    </button>
                </div>

                {/* Recent Orders - Full width */}
                <div className="col-span-12 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900">Órdenes Recientes</h3>
                            <p className="text-sm text-gray-500">Últimas transacciones en la plataforma</p>
                        </div>
                        <button className="flex items-center gap-1 text-sm text-[#E53935] font-medium hover:underline">
                            Ver todas
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>

                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Evento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Monto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Tiempo
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockRecentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-gray-600">
                                                    {order.user.charAt(0)}
                                                </span>
                                            </div>
                                            <span className="font-medium text-gray-900">
                                                {order.user}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {order.event}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {formatCurrency(order.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                                            order.status === 'completed' && 'bg-green-100 text-green-800',
                                            order.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                                            order.status === 'failed' && 'bg-red-100 text-red-800'
                                        )}>
                                            {order.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                            {order.status === 'pending' && <Clock className="w-3 h-3" />}
                                            {order.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                                            {order.status === 'completed' ? 'Completada' :
                                                order.status === 'pending' ? 'Pendiente' : 'Fallida'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {order.time}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
