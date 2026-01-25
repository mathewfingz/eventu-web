'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  Eye,
  Edit,
  Pause,
  Trash2,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type EventStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'PAUSED' | 'SOLD_OUT' | 'COMPLETED';

interface OrganizerEvent {
  id: string;
  name: string;
  date: Date;
  venue: string;
  city: string;
  imageUrl: string;
  status: EventStatus;
  ticketsSold: number;
  totalCapacity: number;
  revenue: number;
}

const statusConfig: Record<EventStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
  PENDING: { label: 'En revisión', color: 'bg-yellow-100 text-yellow-700' },
  PUBLISHED: { label: 'Publicado', color: 'bg-green-100 text-green-700' },
  PAUSED: { label: 'Pausado', color: 'bg-orange-100 text-orange-700' },
  SOLD_OUT: { label: 'Agotado', color: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Finalizado', color: 'bg-gray-100 text-gray-600' },
};

// Mock data
const mockOrganizerEvents: OrganizerEvent[] = [
  {
    id: '1',
    name: 'Festival de Música Electrónica',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    venue: 'Parque Simón Bolívar',
    city: 'Bogotá',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=200&fit=crop',
    status: 'PUBLISHED',
    ticketsSold: 3500,
    totalCapacity: 5000,
    revenue: 525000000,
  },
  {
    id: '2',
    name: 'Concierto de Rock en Vivo',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    venue: 'Coliseo El Campín',
    city: 'Bogotá',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
    status: 'PENDING',
    ticketsSold: 0,
    totalCapacity: 8000,
    revenue: 0,
  },
  {
    id: '3',
    name: 'Noche de Jazz',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    venue: 'Teatro Metropolitano',
    city: 'Medellín',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=200&fit=crop',
    status: 'PUBLISHED',
    ticketsSold: 450,
    totalCapacity: 500,
    revenue: 67500000,
  },
  {
    id: '4',
    name: 'Stand Up Comedy Night',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    venue: 'Teatro Nacional',
    city: 'Bogotá',
    imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400&h=200&fit=crop',
    status: 'COMPLETED',
    ticketsSold: 800,
    totalCapacity: 800,
    revenue: 120000000,
  },
];

export default function OrganizerEventsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const filteredEvents = mockOrganizerEvents.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = mockOrganizerEvents.reduce((sum, e) => sum + e.revenue, 0);
  const totalTickets = mockOrganizerEvents.reduce((sum, e) => sum + e.ticketsSold, 0);
  const activeEvents = mockOrganizerEvents.filter(
    (e) => e.status === 'PUBLISHED' || e.status === 'PENDING'
  ).length;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return formatPrice(value);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/organizer"
                className="text-[#E53935] font-bold text-xl font-[Poppins,sans-serif]"
              >
                Eventu<span className="text-gray-400">/Organizador</span>
              </Link>
            </div>
            <Link
              href="/organizer/events/new"
              className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear evento
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ingresos totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Boletas vendidas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalTickets.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Eventos activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeEvents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
            >
              <option value="all">Todos los estados</option>
              <option value="DRAFT">Borradores</option>
              <option value="PENDING">En revisión</option>
              <option value="PUBLISHED">Publicados</option>
              <option value="PAUSED">Pausados</option>
              <option value="SOLD_OUT">Agotados</option>
              <option value="COMPLETED">Finalizados</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const progress =
                event.totalCapacity > 0
                  ? (event.ticketsSold / event.totalCapacity) * 100
                  : 0;

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {event.name}
                            </h3>
                            <span
                              className={cn(
                                'px-2.5 py-0.5 rounded-full text-xs font-medium',
                                statusConfig[event.status].color
                              )}
                            >
                              {statusConfig[event.status].label}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(event.date, "d MMM, yyyy", { locale: es })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.venue}, {event.city}
                            </span>
                          </div>
                        </div>

                        {/* Actions Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowDropdown(
                                showDropdown === event.id ? null : event.id
                              )
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-5 h-5 text-gray-500" />
                          </button>

                          {showDropdown === event.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Ver evento
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                Editar
                              </button>
                              {event.status === 'PUBLISHED' && (
                                <button className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2">
                                  <Pause className="w-4 h-4" />
                                  Pausar ventas
                                </button>
                              )}
                              {event.status === 'DRAFT' && (
                                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                  <Trash2 className="w-4 h-4" />
                                  Eliminar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
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
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay eventos
              </h3>
              <p className="text-gray-500 mb-6">
                Crea tu primer evento y comienza a vender boletas
              </p>
              <Link
                href="/organizer/events/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Crear evento
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
