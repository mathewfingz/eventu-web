'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PendingEvent {
  id: string;
  name: string;
  promoter: {
    name: string;
    email: string;
    eventsCreated: number;
  };
  venue: string;
  city: string;
  date: Date;
  submittedAt: Date;
  category: string;
  expectedCapacity: number;
  ticketPriceRange: { min: number; max: number };
}

const mockPendingEvents: PendingEvent[] = [
  {
    id: '1',
    name: 'Concierto Reggaeton Night',
    promoter: { name: 'EventosCO', email: 'eventos@eventosco.com', eventsCreated: 5 },
    venue: 'Movistar Arena',
    city: 'Bogotá',
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    category: 'Conciertos',
    expectedCapacity: 14000,
    ticketPriceRange: { min: 150000, max: 500000 },
  },
  {
    id: '2',
    name: 'Festival de Salsa Cali',
    promoter: { name: 'SalsaViva', email: 'info@salsaviva.co', eventsCreated: 12 },
    venue: 'Plaza de Toros Cañaveralejo',
    city: 'Cali',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    category: 'Festivales',
    expectedCapacity: 8000,
    ticketPriceRange: { min: 80000, max: 250000 },
  },
  {
    id: '3',
    name: 'Stand Up Comedy Tour',
    promoter: { name: 'RisasColombia', email: 'contacto@risas.co', eventsCreated: 2 },
    venue: 'Teatro Metropolitano',
    city: 'Medellín',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    category: 'Comedia',
    expectedCapacity: 1500,
    ticketPriceRange: { min: 60000, max: 120000 },
  },
];

export default function PendingEventsPage() {
  const [events, setEvents] = useState(mockPendingEvents);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(search.toLowerCase()) ||
      event.promoter.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (eventId: string) => {
    setActionLoading(eventId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setActionLoading(null);
  };

  const handleReject = async (eventId: string) => {
    setActionLoading(eventId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setActionLoading(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/eventos"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Eventos Pendientes de Aprobación
          </h1>
          <p className="text-gray-500 mt-1">
            {events.length} eventos esperando revisión
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o promotor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.name}
                      </h3>
                      <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Pendiente
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(event.date, "d MMM, yyyy", { locale: es })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.venue}, {event.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Enviado {format(event.submittedAt, "d MMM HH:mm", { locale: es })}
                      </span>
                    </div>

                    {/* Promoter Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {event.promoter.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {event.promoter.email} • {event.promoter.eventsCreated} eventos creados
                        </p>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-sm text-gray-500">Categoría</p>
                        <p className="font-medium text-gray-900">{event.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Capacidad esperada</p>
                        <p className="font-medium text-gray-900">
                          {event.expectedCapacity.toLocaleString()} personas
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rango de precios</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(event.ticketPriceRange.min)} - {formatCurrency(event.ticketPriceRange.max)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleApprove(event.id)}
                    disabled={actionLoading === event.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(event.id)}
                    disabled={actionLoading === event.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors ml-auto">
                    <Eye className="w-4 h-4" />
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Todo al día!
            </h3>
            <p className="text-gray-500">
              No hay eventos pendientes de aprobación
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
