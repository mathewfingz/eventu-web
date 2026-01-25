'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';

interface UpcomingEvent {
  id: string;
  name: string;
  date: Date;
  venue: string;
  city: string;
  imageUrl: string;
  ticketType: string;
  ticketCount: number;
}

const mockUpcomingEvents: UpcomingEvent[] = [
  {
    id: '1',
    name: 'Bad Bunny - World Tour 2026',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    venue: 'Estadio El Campín',
    city: 'Bogotá',
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=200&fit=crop',
    ticketType: 'VIP',
    ticketCount: 2,
  },
  {
    id: '2',
    name: 'Karol G - Mañana Será Bonito',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    venue: 'Movistar Arena',
    city: 'Bogotá',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=200&fit=crop',
    ticketType: 'General',
    ticketCount: 4,
  },
  {
    id: '3',
    name: 'Festival Estéreo Picnic 2026',
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    venue: 'Campo de Golf Briceño',
    city: 'Bogotá',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=200&fit=crop',
    ticketType: 'Pase 4 Días',
    ticketCount: 2,
  },
];

export default function DashboardEventsPage() {
  const now = new Date();
  const oneWeek = addDays(now, 7);

  // Separate events into "this week" and "upcoming"
  const thisWeekEvents = mockUpcomingEvents.filter(
    (event) => isBefore(event.date, oneWeek) && isAfter(event.date, now)
  );
  const laterEvents = mockUpcomingEvents.filter((event) =>
    isAfter(event.date, oneWeek)
  );

  const getDaysUntil = (date: Date) => {
    const diff = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `En ${diff} días`;
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
          <h1 className="text-lg font-semibold">Mis Próximos Eventos</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {mockUpcomingEvents.length > 0 ? (
          <div className="space-y-8">
            {/* This Week */}
            {thisWeekEvents.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#E53935]" />
                  Esta semana
                </h2>
                <div className="space-y-4">
                  {thisWeekEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      daysUntil={getDaysUntil(event.date)}
                      isUrgent
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Later Events */}
            {laterEvents.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  Próximamente
                </h2>
                <div className="space-y-4">
                  {laterEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      daysUntil={getDaysUntil(event.date)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes eventos próximos
            </h3>
            <p className="text-gray-500 mb-6">
              Explora los eventos disponibles y compra tus boletas
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

function EventCard({
  event,
  daysUntil,
  isUrgent = false,
}: {
  event: UpcomingEvent;
  daysUntil: string;
  isUrgent?: boolean;
}) {
  return (
    <Link
      href={`/dashboard/tickets`}
      className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex">
        <div className="w-32 h-32 flex-shrink-0">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${
                  isUrgent
                    ? 'bg-[#E53935]/10 text-[#E53935]'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {daysUntil}
              </span>
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {event.name}
              </h3>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>

          <p className="text-[#E53935] text-sm mt-1">
            {format(event.date, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
          </p>

          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-4 h-4" />
            <span>
              {event.venue}, {event.city}
            </span>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">{event.ticketCount}</span> boleta
            {event.ticketCount > 1 ? 's' : ''} •{' '}
            <span className="text-gray-500">{event.ticketType}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
