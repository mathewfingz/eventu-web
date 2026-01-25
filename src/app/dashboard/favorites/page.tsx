'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Bell, Trash2, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';

interface FavoriteEvent {
  id: string;
  name: string;
  date: Date;
  venue: string;
  city: string;
  imageUrl: string;
  priceFrom: number;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'FEW_LEFT';
  hasAlert: boolean;
}

const mockFavorites: FavoriteEvent[] = [
  {
    id: '1',
    name: 'Coldplay - Music of the Spheres',
    date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    venue: 'Estadio El Campín',
    city: 'Bogotá',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=200&fit=crop',
    priceFrom: 350000,
    status: 'AVAILABLE',
    hasAlert: true,
  },
  {
    id: '2',
    name: 'Taylor Swift - The Eras Tour',
    date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    venue: 'Estadio Atanasio Girardot',
    city: 'Medellín',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=200&fit=crop',
    priceFrom: 450000,
    status: 'SOLD_OUT',
    hasAlert: true,
  },
  {
    id: '3',
    name: 'Rock al Parque 2026',
    date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    venue: 'Parque Simón Bolívar',
    city: 'Bogotá',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
    priceFrom: 0,
    status: 'AVAILABLE',
    hasAlert: false,
  },
  {
    id: '4',
    name: 'Maluma - Papi Juancho Tour',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    venue: 'Arena del Río',
    city: 'Barranquilla',
    imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=200&fit=crop',
    priceFrom: 180000,
    status: 'FEW_LEFT',
    hasAlert: false,
  },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(mockFavorites);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleAlert = (id: string) => {
    setFavorites((prev) =>
      prev.map((f) => (f.id === id ? { ...f, hasAlert: !f.hasAlert } : f))
    );
  };

  const getStatusBadge = (status: FavoriteEvent['status']) => {
    switch (status) {
      case 'SOLD_OUT':
        return (
          <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-medium rounded">
            Agotado
          </span>
        );
      case 'FEW_LEFT':
        return (
          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded">
            Últimas boletas
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Mis Favoritos</h1>
          <span className="ml-auto text-sm text-gray-500">
            {favorites.length} eventos
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {favorites.length > 0 ? (
          <div className="space-y-4">
            {favorites.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="flex">
                  {/* Image */}
                  <Link
                    href={`/events/${event.id}`}
                    className="w-32 sm:w-40 flex-shrink-0"
                  >
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {getStatusBadge(event.status)}
                        <Link href={`/events/${event.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-[#E53935] transition-colors mt-1">
                            {event.name}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    <p className="text-[#E53935] text-sm mt-1">
                      {format(event.date, "d 'de' MMMM, yyyy", { locale: es })}
                    </p>

                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {event.venue}, {event.city}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {event.priceFrom > 0 ? (
                        <span className="text-sm text-gray-600">
                          Desde{' '}
                          <span className="font-semibold text-gray-900">
                            {formatPrice(event.priceFrom)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm text-green-600 font-medium">
                          Gratis
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleAlert(event.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            event.hasAlert
                              ? 'bg-[#E53935]/10 text-[#E53935]'
                              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                          }`}
                          title={
                            event.hasAlert
                              ? 'Desactivar alertas'
                              : 'Activar alertas'
                          }
                        >
                          <Bell
                            className={`w-5 h-5 ${
                              event.hasAlert ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => removeFavorite(event.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Quitar de favoritos"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alert Banner */}
                {event.hasAlert && (
                  <div className="px-4 py-2 bg-[#E53935]/5 border-t border-[#E53935]/10 flex items-center gap-2 text-sm text-[#E53935]">
                    <Bell className="w-4 h-4" />
                    <span>
                      Recibirás alertas de preventas y disponibilidad
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes favoritos
            </h3>
            <p className="text-gray-500 mb-6">
              Guarda eventos que te interesen para no perderte ninguna novedad
            </p>
            <Link
              href="/events"
              className="inline-block px-6 py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
            >
              Explorar eventos
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
