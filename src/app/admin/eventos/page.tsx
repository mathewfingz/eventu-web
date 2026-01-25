'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  MapPin,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventDetailModal } from '@/components/admin/event-detail-modal';

interface Event {
  id: string;
  name: string;
  promoter: {
    name: string | null;
    email: string;
  };
  venue: {
    name: string;
    city: string;
  };
  date: string;
  status:
    | 'DRAFT'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'PUBLISHED'
    | 'SOLD_OUT'
    | 'CANCELLED'
    | 'COMPLETED';
  ticketsSold: number;
  totalCapacity: number;
  revenue: number;
  isFeatured: boolean;
}

const statusConfig: Record<
  Event['status'],
  { label: string; color: string }
> = {
  DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  PENDING_APPROVAL: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
  },
  APPROVED: { label: 'Aprobado', color: 'bg-blue-100 text-blue-800' },
  PUBLISHED: { label: 'Publicado', color: 'bg-green-100 text-green-800' },
  SOLD_OUT: { label: 'Agotado', color: 'bg-purple-100 text-purple-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  COMPLETED: { label: 'Finalizado', color: 'bg-gray-100 text-gray-600' },
};

// Mock data for now - will be replaced with API call
const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Bad Bunny - World Tour',
    promoter: { name: 'Live Nation Colombia', email: 'contact@livenation.co' },
    venue: { name: 'Estadio El Campín', city: 'Bogotá' },
    date: '2026-03-15',
    status: 'PUBLISHED',
    ticketsSold: 42000,
    totalCapacity: 45000,
    revenue: 1890000000,
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Festival Estéreo Picnic 2026',
    promoter: { name: 'Páramo Presenta', email: 'info@paramo.co' },
    venue: { name: 'Campo de Golf Briceño', city: 'Bogotá' },
    date: '2026-03-27',
    status: 'PUBLISHED',
    ticketsSold: 85000,
    totalCapacity: 100000,
    revenue: 3400000000,
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Concierto Reggaeton Night',
    promoter: { name: 'EventosCO', email: 'eventos@eventosco.com' },
    venue: { name: 'Movistar Arena', city: 'Bogotá' },
    date: '2026-02-15',
    status: 'PENDING_APPROVAL',
    ticketsSold: 0,
    totalCapacity: 14000,
    revenue: 0,
    isFeatured: false,
  },
  {
    id: '4',
    name: 'Festival de Salsa',
    promoter: { name: 'SalsaViva', email: 'contacto@salsaviva.co' },
    venue: { name: 'Plaza de Toros', city: 'Cali' },
    date: '2026-03-01',
    status: 'PENDING_APPROVAL',
    ticketsSold: 0,
    totalCapacity: 8000,
    revenue: 0,
    isFeatured: false,
  },
  {
    id: '5',
    name: 'Shakira Live',
    promoter: { name: 'Ocesa', email: 'info@ocesa.com' },
    venue: { name: 'Estadio El Campín', city: 'Bogotá' },
    date: '2026-04-20',
    status: 'APPROVED',
    ticketsSold: 0,
    totalCapacity: 45000,
    revenue: 0,
    isFeatured: true,
  },
  {
    id: '6',
    name: 'Coldplay - Music of the Spheres',
    promoter: { name: 'Live Nation', email: 'info@livenation.co' },
    venue: { name: 'Estadio El Campín', city: 'Bogotá' },
    date: '2026-05-10',
    status: 'PUBLISHED',
    ticketsSold: 38000,
    totalCapacity: 45000,
    revenue: 1520000000,
    isFeatured: true,
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredEvents = events.filter((event) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm) ||
      event.promoter.name?.toLowerCase().includes(searchTerm) ||
      event.promoter.email.toLowerCase().includes(searchTerm);
    const matchesStatus =
      statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = events.filter(
    (e) => e.status === 'PENDING_APPROVAL'
  ).length;

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
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

  const handleViewDetail = (eventId: string) => {
    setSelectedEventId(eventId);
    setModalOpen(true);
    setShowDropdown(null);
  };

  const handleQuickAction = async (
    eventId: string,
    action: 'approve' | 'reject' | 'feature'
  ) => {
    setActionLoading(`${eventId}-${action}`);
    setShowDropdown(null);

    try {
      let body = {};
      switch (action) {
        case 'approve':
          body = { status: 'APPROVED' };
          break;
        case 'reject':
          body = { status: 'DRAFT' };
          break;
        case 'feature':
          body = { isFeatured: true };
          break;
      }

      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // Update local state
        setEvents((prev) =>
          prev.map((e) => {
            if (e.id === eventId) {
              return {
                ...e,
                ...(action === 'approve' && { status: 'APPROVED' as const }),
                ...(action === 'reject' && { status: 'DRAFT' as const }),
                ...(action === 'feature' && { isFeatured: true }),
              };
            }
            return e;
          })
        );
      }
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const refreshEvents = () => {
    // In a real app, this would fetch from API
    // For now, just close the dropdown
    setShowDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(null);
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-500 mt-1">
            Gestiona todos los eventos de la plataforma
          </p>
        </div>

        {pendingCount > 0 && (
          <Link
            href="/admin/eventos/pendientes"
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            {pendingCount} pendientes de aprobación
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o promotor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
          >
            <option value="all">Todos los estados</option>
            <option value="PENDING_APPROVAL">Pendientes</option>
            <option value="APPROVED">Aprobados</option>
            <option value="PUBLISHED">Publicados</option>
            <option value="SOLD_OUT">Agotados</option>
            <option value="COMPLETED">Finalizados</option>
            <option value="CANCELLED">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const progress =
            event.totalCapacity > 0
              ? (event.ticketsSold / event.totalCapacity) * 100
              : 0;

          return (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {event.name}
                      </h3>
                      {event.isFeatured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {event.promoter.name || event.promoter.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        statusConfig[event.status].color
                      )}
                    >
                      {statusConfig[event.status].label}
                    </span>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(
                            showDropdown === event.id ? null : event.id
                          );
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                      </button>

                      {showDropdown === event.id && (
                        <div
                          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleViewDetail(event.id)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Ver detalle
                          </button>
                          {event.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                onClick={() =>
                                  handleQuickAction(event.id, 'approve')
                                }
                                disabled={
                                  actionLoading === `${event.id}-approve`
                                }
                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 disabled:opacity-50"
                              >
                                {actionLoading === `${event.id}-approve` ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Aprobar
                              </button>
                              <button
                                onClick={() =>
                                  handleQuickAction(event.id, 'reject')
                                }
                                disabled={
                                  actionLoading === `${event.id}-reject`
                                }
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                              >
                                {actionLoading === `${event.id}-reject` ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                Rechazar
                              </button>
                            </>
                          )}
                          {!event.isFeatured && (
                            <button
                              onClick={() =>
                                handleQuickAction(event.id, 'feature')
                              }
                              disabled={
                                actionLoading === `${event.id}-feature`
                              }
                              className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === `${event.id}-feature` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Star className="w-4 h-4" />
                              )}
                              Destacar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Event info */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.date).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.venue.name}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Vendidas</p>
                    <p className="font-semibold text-gray-900">
                      {event.ticketsSold.toLocaleString()}
                      <span className="text-gray-400 font-normal">
                        /{event.totalCapacity.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ocupación</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            progress >= 90
                              ? 'bg-green-500'
                              : progress >= 50
                                ? 'bg-blue-500'
                                : 'bg-gray-400'
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ingresos</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(event.revenue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">No se encontraron eventos</p>
        </div>
      )}

      {/* Event Detail Modal */}
      <EventDetailModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEventId(null);
        }}
        onUpdate={refreshEvents}
        eventId={selectedEventId}
      />
    </div>
  );
}
