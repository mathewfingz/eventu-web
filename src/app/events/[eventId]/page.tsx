'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getEventById, mockEvents } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Share2,
  Heart,
  Shield,
  Ticket,
  Info,
  ChevronRight,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventDetailPage({ params }: PageProps) {
  const { eventId } = use(params);
  const router = useRouter();
  const event = getEventById(eventId);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Evento no encontrado
            </h1>
            <p className="text-gray-500 mb-6">
              El evento que buscas no existe o ya no está disponible.
            </p>
            <Link
              href="/events"
              className="px-6 py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors inline-block"
            >
              Ver todos los eventos
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const relatedEvents = mockEvents
    .filter((e) => e.id !== event.id && e.category === event.category)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative h-[300px] sm:h-[400px] md:h-[500px]">
          <img
            src={event.bannerUrl || event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Back Button */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Volver</span>
            </button>
          </div>

          {/* Share & Favorite */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2">
            <button className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Event Title */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
              <span className="inline-block px-3 py-1 bg-[#E53935] text-white text-sm font-medium rounded-full mb-3">
                {event.category}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white font-[Poppins,sans-serif] mb-2">
                {event.name}
              </h1>
              <p className="text-white/80 text-lg">
                {event.venue.name}, {event.venue.city}
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#E53935]/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-[#E53935]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-semibold text-gray-900">
                        {format(eventDate, "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#E53935]/10 rounded-lg">
                      <Clock className="w-5 h-5 text-[#E53935]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hora</p>
                      <p className="font-semibold text-gray-900">
                        {format(eventDate, "HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#E53935]/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-[#E53935]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lugar</p>
                      <p className="font-semibold text-gray-900">
                        {event.venue.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#E53935]/10 rounded-lg">
                      <Ticket className="w-5 h-5 text-[#E53935]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Desde</p>
                      <p className="font-semibold text-[#E53935]">
                        {formatPrice(event.priceFrom)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-[Poppins,sans-serif]">
                  Acerca del evento
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Artist Info */}
              {event.artist && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 font-[Poppins,sans-serif]">
                    Artista
                  </h2>
                  <div className="flex items-start gap-4">
                    <img
                      src={event.artist.imageUrl}
                      alt={event.artist.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {event.artist.name}
                      </h3>
                      <p className="text-gray-600 mt-1">{event.artist.bio}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Venue Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-[Poppins,sans-serif]">
                  Ubicación
                </h2>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {event.venue.name}
                    </h3>
                    <p className="text-gray-600">{event.venue.address}</p>
                    <p className="text-gray-600">{event.venue.city}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        `${event.venue.name} ${event.venue.city}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E53935] text-sm font-medium mt-2 inline-block hover:underline"
                    >
                      Ver en Google Maps
                    </a>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="mt-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Mapa del lugar</span>
                </div>
              </div>

              {/* Organizer */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-[Poppins,sans-serif]">
                  Organizador
                </h2>
                <div className="flex items-center gap-4">
                  <img
                    src={event.organizer.imageUrl}
                    alt={event.organizer.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {event.organizer.name}
                    </h3>
                    <p className="text-gray-500 text-sm">Organizador verificado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Tickets */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm sticky top-24 overflow-hidden">
                {/* Status Banner */}
                {event.status === 'SOLD_OUT' && (
                  <div className="bg-gray-900 text-white text-center py-3 font-medium">
                    Evento Agotado
                  </div>
                )}
                {event.status === 'FEW_LEFT' && (
                  <div className="bg-orange-500 text-white text-center py-3 font-medium">
                    ¡Últimas boletas!
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Selecciona tus boletas
                  </h3>

                  {event.tickets.length > 0 ? (
                    <>
                      {/* Tickets List */}
                      <div className="space-y-3 mb-6">
                        {event.tickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#E53935] transition-colors"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {ticket.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {ticket.description}
                              </p>
                              {ticket.available < 50 && (
                                <p className="text-xs text-orange-500 mt-1">
                                  Solo quedan {ticket.available}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#E53935]">
                                {formatPrice(ticket.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <Link
                        href={`/events/${event.id}/tickets`}
                        className="block w-full py-4 bg-[#E53935] text-white text-center rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors"
                      >
                        Comprar boletas
                      </Link>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No hay boletas disponibles para este evento.
                      </p>
                    </div>
                  )}

                  {/* Security Badge */}
                  <div className="flex items-center gap-2 mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Compra 100% segura con SafeTix</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-[Poppins,sans-serif]">
                  Eventos similares
                </h2>
                <Link
                  href="/events"
                  className="text-[#E53935] font-medium hover:underline flex items-center gap-1"
                >
                  Ver todos
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedEvents.map((relatedEvent) => (
                  <Link
                    key={relatedEvent.id}
                    href={`/events/${relatedEvent.id}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img
                      src={relatedEvent.imageUrl}
                      alt={relatedEvent.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {relatedEvent.name}
                      </h3>
                      <p className="text-sm text-[#E53935] mt-1">
                        {format(new Date(relatedEvent.date), "d MMM", {
                          locale: es,
                        })}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Desde {formatPrice(relatedEvent.priceFrom)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
