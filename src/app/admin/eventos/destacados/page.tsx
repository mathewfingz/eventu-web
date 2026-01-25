'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Star,
  StarOff,
  ArrowLeft,
  Calendar,
  MapPin,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FeaturedEvent {
  id: string;
  name: string;
  venue: string;
  city: string;
  date: Date;
  imageUrl: string;
  isFeatured: boolean;
  position?: number;
}

const mockEvents: FeaturedEvent[] = [
  {
    id: '1',
    name: 'Bad Bunny - World Tour',
    venue: 'Estadio El Campín',
    city: 'Bogotá',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=200&h=120&fit=crop',
    isFeatured: true,
    position: 1,
  },
  {
    id: '2',
    name: 'Festival Estéreo Picnic 2026',
    venue: 'Campo de Golf Briceño',
    city: 'Bogotá',
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=120&fit=crop',
    isFeatured: true,
    position: 2,
  },
  {
    id: '3',
    name: 'Shakira Live',
    venue: 'Estadio Atanasio Girardot',
    city: 'Medellín',
    date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=120&fit=crop',
    isFeatured: true,
    position: 3,
  },
  {
    id: '4',
    name: 'Karol G - Mañana Será Bonito',
    venue: 'Movistar Arena',
    city: 'Bogotá',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200&h=120&fit=crop',
    isFeatured: false,
  },
  {
    id: '5',
    name: 'Coldplay - Music of the Spheres',
    venue: 'Estadio El Campín',
    city: 'Bogotá',
    date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=120&fit=crop',
    isFeatured: false,
  },
];

export default function FeaturedEventsPage() {
  const [events, setEvents] = useState(mockEvents);
  const [search, setSearch] = useState('');

  const featuredEvents = events
    .filter((e) => e.isFeatured)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const availableEvents = events.filter(
    (e) =>
      !e.isFeatured &&
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.venue.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleFeatured = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          if (e.isFeatured) {
            return { ...e, isFeatured: false, position: undefined };
          } else {
            const maxPosition = Math.max(
              0,
              ...prev.filter((ev) => ev.isFeatured).map((ev) => ev.position || 0)
            );
            return { ...e, isFeatured: true, position: maxPosition + 1 };
          }
        }
        return e;
      })
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Eventos Destacados</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los eventos que aparecen en la página principal
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Featured Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Eventos Destacados ({featuredEvents.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Arrastra para reordenar
            </p>
          </div>

          <div className="p-4 space-y-3">
            {featuredEvents.length > 0 ? (
              featuredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <button className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </button>
                  <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(event.date, "d MMM", { locale: es })} • {event.city}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFeatured(event.id)}
                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                    title="Quitar de destacados"
                  >
                    <StarOff className="w-5 h-5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No hay eventos destacados</p>
                <p className="text-sm">Agrega eventos desde la lista</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Eventos Disponibles</h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
              />
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {availableEvents.length > 0 ? (
              availableEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(event.date, "d MMM", { locale: es })} • {event.city}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFeatured(event.id)}
                    className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Agregar a destacados"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No se encontraron eventos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
