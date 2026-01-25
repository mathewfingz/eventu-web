'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Bell,
    Search,
    ChevronDown,
    Calendar,
    Check,
    Sparkles
} from 'lucide-react';

interface Event {
    id: string;
    name: string;
    date: string;
    status: string;
}

interface CoordinatorHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
    events?: Event[];
    currentEventId?: string;
    onEventChange?: (eventId: string) => void;
}

export function CoordinatorHeader({
    user,
    events = [],
    currentEventId,
    onEventChange
}: CoordinatorHeaderProps) {
    const pathname = usePathname();
    const [isEventSelectorOpen, setIsEventSelectorOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const currentEvent = events.find(e => e.id === currentEventId);

    // Get page title based on pathname
    const getPageInfo = () => {
        if (pathname === '/coordinator') return { title: 'Dashboard', subtitle: 'Vista general' };
        if (pathname === '/coordinator/eventos') return { title: 'Eventos', subtitle: 'Tus eventos asignados' };
        if (pathname === '/coordinator/scanner') return { title: 'Scanner', subtitle: 'Validar boletas' };
        if (pathname.includes('/ventas')) return { title: 'Ventas', subtitle: 'Ordenes y transacciones' };
        if (pathname.includes('/preventas')) return { title: 'Preventas', subtitle: 'Codigos y etapas' };
        if (pathname.includes('/mapa')) return { title: 'Mapa', subtitle: 'Editor de asientos' };
        if (pathname.includes('/imagenes')) return { title: 'Imagenes', subtitle: 'Media del evento' };
        if (pathname.includes('/boletas')) return { title: 'Boletas', subtitle: 'Tipos y precios' };
        if (pathname.includes('/estadisticas')) return { title: 'Stats', subtitle: 'Metricas en vivo' };
        if (pathname.includes('/reportes')) return { title: 'Reportes', subtitle: 'Exportar datos' };
        if (pathname.includes('/eventos/')) return { title: 'Evento', subtitle: currentEvent?.name || 'Detalle' };
        return { title: 'Coordinador', subtitle: '' };
    };

    const pageInfo = getPageInfo();

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <header className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-4">
            {/* Left side - Page title */}
            <div className="flex items-center gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-semibold text-gray-900">
                            {pageInfo.title}
                        </h1>
                        {pageInfo.subtitle && (
                            <>
                                <span className="text-gray-300">/</span>
                                <span className="text-xs text-gray-500">{pageInfo.subtitle}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Right side - Event selector, notifications, user */}
            <div className="flex items-center gap-2">
                {/* Event Quick Selector */}
                {events.length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setIsEventSelectorOpen(!isEventSelectorOpen)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-100"
                        >
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">
                                {currentEvent?.name || 'Evento'}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isEventSelectorOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        {isEventSelectorOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsEventSelectorOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-20 overflow-hidden">
                                    {/* Search */}
                                    <div className="p-2 border-b border-gray-50">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Buscar..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                            />
                                        </div>
                                    </div>

                                    {/* Events list */}
                                    <div className="max-h-52 overflow-y-auto">
                                        {filteredEvents.length === 0 ? (
                                            <div className="p-3 text-center text-xs text-gray-500">
                                                Sin resultados
                                            </div>
                                        ) : (
                                            filteredEvents.map((event) => (
                                                <button
                                                    key={event.id}
                                                    onClick={() => {
                                                        onEventChange?.(event.id);
                                                        setIsEventSelectorOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-gray-900 truncate">
                                                            {event.name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">
                                                            {new Date(event.date).toLocaleDateString('es-CO', {
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })}
                                                        </p>
                                                    </div>
                                                    {event.id === currentEventId && (
                                                        <Check className="w-3.5 h-3.5 text-[#E53935]" />
                                                    )}
                                                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                                                        event.status === 'PUBLISHED'
                                                            ? 'bg-emerald-50 text-emerald-600'
                                                            : event.status === 'DRAFT'
                                                            ? 'bg-gray-100 text-gray-500'
                                                            : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {event.status === 'PUBLISHED' ? 'Live' :
                                                         event.status === 'DRAFT' ? 'Draft' : event.status}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    {/* View all link */}
                                    <div className="p-1.5 border-t border-gray-50">
                                        <Link
                                            href="/coordinator/eventos"
                                            onClick={() => setIsEventSelectorOpen(false)}
                                            className="block w-full text-center text-xs text-[#E53935] hover:text-[#C62828] py-1.5 rounded-md hover:bg-red-50/50 transition-colors"
                                        >
                                            Ver todos
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Notifications */}
                <button className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#E53935] rounded-full" />
                </button>

                {/* Divider */}
                <div className="h-5 w-px bg-gray-100 mx-1" />

                {/* User avatar */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-amber-100 to-orange-100 rounded-md flex items-center justify-center">
                        <span className="text-xs font-semibold text-amber-700">
                            {user.name?.charAt(0).toUpperCase() || 'C'}
                        </span>
                    </div>
                    <span className="text-xs font-medium text-gray-700 hidden lg:block">
                        {user.name?.split(' ')[0] || 'Coordinador'}
                    </span>
                </div>
            </div>
        </header>
    );
}
