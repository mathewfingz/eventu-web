'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Calendar,
    MapPin,
    Search,
    LayoutGrid,
    List,
    ChevronRight,
    Ticket,
    TrendingUp,
    Users,
    Clock
} from 'lucide-react';

// Mock events data
const mockEvents = [
    {
        id: '1',
        name: 'Concierto de Reggaeton Night',
        date: '2026-01-25T20:00:00',
        venue: 'Movistar Arena, Bogota',
        imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
        status: 'PUBLISHED',
        ticketsSold: 1234,
        totalCapacity: 1500,
        revenue: 32500000,
        category: 'CONCERT'
    },
    {
        id: '2',
        name: 'Festival de Salsa',
        date: '2026-03-01T18:00:00',
        venue: 'Estadio El Campin',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
        status: 'PUBLISHED',
        ticketsSold: 2100,
        totalCapacity: 3200,
        revenue: 45000000,
        category: 'FESTIVAL'
    },
    {
        id: '3',
        name: 'Rock en el Parque',
        date: '2026-04-15T14:00:00',
        venue: 'Parque Simon Bolivar',
        imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
        status: 'DRAFT',
        ticketsSold: 0,
        totalCapacity: 5000,
        revenue: 0,
        category: 'FESTIVAL'
    },
    {
        id: '4',
        name: 'Comedy Night - Stand Up',
        date: '2026-02-14T21:00:00',
        venue: 'Teatro Nacional',
        imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400',
        status: 'SOLD_OUT',
        ticketsSold: 500,
        totalCapacity: 500,
        revenue: 15000000,
        category: 'STANDUP'
    }
];

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    DRAFT: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Borrador' },
    PENDING_APPROVAL: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400', label: 'Pendiente' },
    PUBLISHED: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400', label: 'Publicado' },
    SOLD_OUT: { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-400', label: 'Agotado' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', label: 'Cancelado' },
    COMPLETED: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400', label: 'Finalizado' }
};

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
};

export default function CoordinatorEventsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredEvents = mockEvents.filter(event => {
        const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.venue.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-4 lg:p-6 bg-gray-50/50 min-h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Eventos</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {filteredEvents.length} eventos asignados
                    </p>
                </div>

                {/* Search and filters */}
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E53935]/20 focus:border-[#E53935] w-44"
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E53935]/20 focus:border-[#E53935] bg-white"
                    >
                        <option value="all">Todos</option>
                        <option value="DRAFT">Borrador</option>
                        <option value="PUBLISHED">Publicado</option>
                        <option value="SOLD_OUT">Agotado</option>
                    </select>

                    {/* View toggle */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-md p-0.5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Events Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredEvents.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link href={`/coordinator/eventos/${event.id}`}>
                                <div className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all group">
                                    {/* Image */}
                                    <div className="relative h-28 bg-gray-100">
                                        <img
                                            src={event.imageUrl}
                                            alt={event.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        <div className="absolute top-2 left-2">
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${statusConfig[event.status].bg} ${statusConfig[event.status].text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[event.status].dot}`} />
                                                {statusConfig[event.status].label}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-2 left-2 right-2">
                                            <h3 className="text-sm font-semibold text-white truncate drop-shadow-sm">
                                                {event.name}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-3">
                                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(event.date).toLocaleDateString('es-CO', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1 truncate">
                                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{event.venue.split(',')[0]}</span>
                                            </span>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Ticket className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-xs font-semibold text-gray-900">
                                                    {event.ticketsSold.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    /{event.totalCapacity.toLocaleString()}
                                                </span>
                                            </div>
                                            <span className="text-xs font-semibold text-emerald-600">
                                                {formatCurrency(event.revenue)}
                                            </span>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#E53935] rounded-full transition-all"
                                                style={{ width: `${(event.ticketsSold / event.totalCapacity) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Evento</th>
                                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Ventas</th>
                                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Ingresos</th>
                                    <th className="text-right px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredEvents.map((event, index) => (
                                    <motion.tr
                                        key={event.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="hover:bg-gray-50/50 group"
                                    >
                                        <td className="px-4 py-3">
                                            <Link href={`/coordinator/eventos/${event.id}`} className="flex items-center gap-3">
                                                <img
                                                    src={event.imageUrl}
                                                    alt={event.name}
                                                    className="w-9 h-9 rounded-md object-cover"
                                                />
                                                <div>
                                                    <span className="text-xs font-medium text-gray-900 group-hover:text-[#E53935] transition-colors">{event.name}</span>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                        <MapPin className="w-2.5 h-2.5" />
                                                        {event.venue.split(',')[0]}
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs text-gray-600">
                                                {new Date(event.date).toLocaleDateString('es-CO', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {new Date(event.date).toLocaleTimeString('es-CO', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${statusConfig[event.status].bg} ${statusConfig[event.status].text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[event.status].dot}`} />
                                                {statusConfig[event.status].label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#E53935] rounded-full"
                                                        style={{ width: `${(event.ticketsSold / event.totalCapacity) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-600">
                                                    {Math.round((event.ticketsSold / event.totalCapacity) * 100)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-semibold text-emerald-600">
                                                {formatCurrency(event.revenue)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/coordinator/eventos/${event.id}`}
                                                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#E53935] transition-colors"
                                            >
                                                Gestionar
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Sin resultados</h3>
                    <p className="text-xs text-gray-500">Ajusta los filtros de busqueda</p>
                </div>
            )}
        </div>
    );
}
