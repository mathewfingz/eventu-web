'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Calendar,
    DollarSign,
    Users,
    BarChart3,
    Plus,
    ChevronRight,
    TrendingUp,
    Ticket,
    Eye,
    Settings,
} from 'lucide-react';

// Mock data for development
const mockStats = {
    totalEvents: 12,
    activeEvents: 3,
    totalSales: 45680000,
    totalAttendees: 2340,
};

const mockEvents = [
    {
        id: '1',
        name: 'Concierto de Reggaeton Night',
        date: '2026-02-15',
        venue: 'Movistar Arena, Bogotá',
        ticketsSold: 450,
        revenue: 18500000,
        status: 'ACTIVE',
    },
    {
        id: '2',
        name: 'Festival de Salsa',
        date: '2026-03-01',
        venue: 'Estadio El Campín',
        ticketsSold: 1200,
        revenue: 42000000,
        status: 'ACTIVE',
    },
    {
        id: '3',
        name: 'Comedy Night con Franco Escamilla',
        date: '2026-01-28',
        venue: 'Teatro Metropolitano',
        ticketsSold: 380,
        revenue: 9500000,
        status: 'ACTIVE',
    },
];

const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(value);
};

export default function OrganizerDashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#E53935] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    E
                                </div>
                                <span className="text-xl font-bold text-[#E53935] font-[Poppins,sans-serif]">
                                    Eventu
                                </span>
                            </Link>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                Organizador
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                🔧 Modo Desarrollo
                            </span>
                            <Link
                                href="/"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#212121] font-[Poppins,sans-serif]">
                        ¡Hola, Organizador! 👋
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Aquí está el resumen de tus eventos
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-500">Total Eventos</span>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-[#212121]">{mockStats.totalEvents}</p>
                        <p className="text-sm text-gray-500">{mockStats.activeEvents} activos</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-500">Ventas Totales</span>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <DollarSign className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-[#212121]">{formatPrice(mockStats.totalSales)}</p>
                        <p className="text-sm text-green-600 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +15% este mes
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-500">Asistentes</span>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-[#212121]">{mockStats.totalAttendees.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">personas en tus eventos</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-500">Rendimiento</span>
                            <div className="p-2 bg-[#E53935]/10 rounded-lg">
                                <BarChart3 className="w-4 h-4 text-[#E53935]" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-[#212121]">92%</p>
                        <p className="text-sm text-gray-500">tasa de ocupación</p>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Link
                        href="/organizer/events/new"
                        className="bg-[#E53935] text-white rounded-xl p-4 flex items-center gap-3 hover:bg-[#B71C1C] transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Crear Evento</span>
                    </Link>
                    <Link
                        href="/organizer/settlements"
                        className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-700">Liquidaciones</span>
                    </Link>
                    <Link
                        href="/organizer/analytics"
                        className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-700">Analytics</span>
                    </Link>
                    <Link
                        href="/organizer/settings"
                        className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                        <Settings className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Configuración</span>
                    </Link>
                </div>

                {/* Events List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[#212121]">Mis Eventos</h2>
                        <Link href="/organizer/events" className="text-[#E53935] text-sm font-medium">
                            Ver todos
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {mockEvents.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-[#212121]">
                                                {event.name}
                                            </h3>
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                Activo
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(event.date).toLocaleDateString('es-CO', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                            <span>{event.venue}</span>
                                        </div>
                                    </div>

                                    <div className="text-right mr-4">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-[#212121]">{event.ticketsSold}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Ticket className="w-3 h-3" /> vendidas
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-green-600">{formatPrice(event.revenue)}</p>
                                                <p className="text-xs text-gray-500">ingresos</p>
                                            </div>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
