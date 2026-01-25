'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    QrCode,
    Users,
    CheckCircle,
    XCircle,
    Calendar,
    MapPin,
    ChevronRight,
    Activity,
    TrendingUp,
    Ticket,
    DollarSign,
    Zap,
    Clock
} from 'lucide-react';

// Mock data for development
const mockStats = {
    validated: 234,
    rejected: 12,
    pending: 1456,
    rate: 95,
    totalSales: 45600000,
    ticketsSold: 1702
};

const mockEvents = [
    {
        id: '1',
        name: 'Concierto de Reggaeton Night',
        date: '2026-01-25T20:00:00',
        venue: 'Movistar Arena, Bogota',
        status: 'LIVE',
        validated: 234,
        total: 1500,
        revenue: 32500000,
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=100&h=100&fit=crop'
    },
    {
        id: '2',
        name: 'Festival de Salsa',
        date: '2026-03-01T18:00:00',
        venue: 'Estadio El Campin',
        status: 'UPCOMING',
        validated: 0,
        total: 3200,
        revenue: 13100000,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop'
    },
    {
        id: '3',
        name: 'Rock en el Parque 2026',
        date: '2026-04-15T14:00:00',
        venue: 'Parque Simon Bolivar',
        status: 'UPCOMING',
        validated: 0,
        total: 8500,
        revenue: 0,
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop'
    }
];

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
};

export default function CoordinatorDashboard() {
    return (
        <div className="p-4 lg:p-6 bg-gray-50/50 min-h-full">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Resumen de actividad</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Actualizado hace 2 min</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Validados</span>
                        <div className="w-7 h-7 bg-emerald-50 rounded-md flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{mockStats.validated}</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +12% vs ayer
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rechazados</span>
                        <div className="w-7 h-7 bg-red-50 rounded-md flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{mockStats.rejected}</p>
                    <p className="text-xs text-gray-400 mt-1">intentos fallidos</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendidas</span>
                        <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center">
                            <Ticket className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{mockStats.ticketsSold.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">boletas totales</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tasa Exito</span>
                        <div className="w-7 h-7 bg-violet-50 rounded-md flex items-center justify-center">
                            <Activity className="w-4 h-4 text-violet-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{mockStats.rate}%</p>
                    <p className="text-xs text-gray-400 mt-1">validaciones OK</p>
                </motion.div>
            </div>

            {/* Scanner CTA */}
            <Link href="/coordinator/scanner" className="block mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    className="bg-gradient-to-r from-[#E53935] to-[#C62828] rounded-xl p-4 flex items-center justify-between shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <QrCode className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                Abrir Scanner
                                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                            </h2>
                            <p className="text-xs text-white/70">Escanea QR para validar boletas</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/50" />
                </motion.div>
            </Link>

            {/* Events List */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900">Mis Eventos</h2>
                    <Link
                        href="/coordinator/eventos"
                        className="text-xs text-[#E53935] hover:text-[#C62828] font-medium transition-colors"
                    >
                        Ver todos
                    </Link>
                </div>

                <div className="divide-y divide-gray-50">
                    {mockEvents.map((event, index) => (
                        <Link
                            key={event.id}
                            href={`/coordinator/eventos/${event.id}`}
                            className="block"
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="px-4 py-3 hover:bg-gray-50/50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Event Image */}
                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                        <img
                                            src={event.image}
                                            alt={event.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Event Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {event.name}
                                            </h3>
                                            {event.status === 'LIVE' ? (
                                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded flex items-center gap-1 flex-shrink-0 uppercase">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                    Live
                                                </span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded flex-shrink-0">
                                                    Proximo
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(event.date).toLocaleDateString('es-CO', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1 truncate">
                                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{event.venue}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="hidden sm:flex items-center gap-4">
                                        {/* Attendance */}
                                        <div className="text-right">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {event.validated}
                                                </span>
                                                <span className="text-xs text-gray-400">/{event.total}</span>
                                            </div>
                                            <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className="h-full bg-[#E53935] rounded-full transition-all"
                                                    style={{ width: `${(event.validated / event.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Revenue */}
                                        <div className="text-right hidden md:block min-w-[70px]">
                                            <div className="flex items-center gap-1 justify-end">
                                                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(event.revenue)}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-400">ventas</span>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
