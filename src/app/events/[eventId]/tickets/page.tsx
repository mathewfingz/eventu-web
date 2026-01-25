'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getEventById } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Minus,
  Plus,
  Clock,
  Shield,
  Info,
  AlertTriangle,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

interface TicketSelection {
  [ticketId: string]: number;
}

export default function TicketSelectionPage({ params }: PageProps) {
  const { eventId } = use(params);
  const router = useRouter();
  const event = getEventById(eventId);

  const [selectedTickets, setSelectedTickets] = useState<TicketSelection>({});

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="text-6xl mb-4">🎫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Evento no encontrado
          </h1>
          <Link
            href="/events"
            className="text-[#E53935] font-medium hover:underline"
          >
            Ver todos los eventos
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);

  const updateTicketQuantity = (ticketId: string, delta: number) => {
    setSelectedTickets((prev) => {
      const ticket = event.tickets.find((t) => t.id === ticketId);
      if (!ticket) return prev;

      const currentQty = prev[ticketId] || 0;
      const newQty = Math.max(0, Math.min(ticket.maxPerOrder, currentQty + delta));

      if (newQty === 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [ticketId]: newQty };
    });
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const getSubtotal = () => {
    return Object.entries(selectedTickets).reduce((sum, [ticketId, qty]) => {
      const ticket = event.tickets.find((t) => t.id === ticketId);
      return sum + (ticket ? ticket.price * qty : 0);
    }, 0);
  };

  const handleContinue = () => {
    // En producción, guardaríamos la selección en el estado/contexto/localStorage
    // y redireccionaríamos al checkout
    router.push('/checkout');
  };

  const totalTickets = getTotalTickets();
  const subtotal = getSubtotal();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">Seleccionar boletas</h1>
            <p className="text-sm text-gray-500">{event.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Ticket Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Mini Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">{event.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(eventDate, "d MMM, yyyy", { locale: es })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(eventDate, "HH:mm")}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {event.venue.name}
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tipos de boletas
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Selecciona la cantidad de boletas que deseas
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {event.tickets.map((ticket) => {
                  const quantity = selectedTickets[ticket.id] || 0;
                  const isLowStock = ticket.available < 50;

                  return (
                    <div
                      key={ticket.id}
                      className="p-6 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {ticket.name}
                          </h4>
                          {isLowStock && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                              Últimas {ticket.available}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {ticket.description}
                        </p>
                        <p className="text-lg font-bold text-[#E53935] mt-2">
                          {formatPrice(ticket.price)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Máx. {ticket.maxPerOrder} por orden
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateTicketQuantity(ticket.id, -1)}
                          disabled={quantity === 0}
                          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-lg">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateTicketQuantity(ticket.id, 1)}
                          disabled={quantity >= ticket.maxPerOrder}
                          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Información importante</p>
                <ul className="mt-2 space-y-1 text-blue-700">
                  <li>• Las boletas son personales e intransferibles</li>
                  <li>• Recibirás tus boletas digitales por correo electrónico</li>
                  <li>• Deberás presentar tu identificación en el ingreso</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm sticky top-24">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Resumen de tu orden
                </h3>
              </div>

              <div className="p-6">
                {totalTickets > 0 ? (
                  <>
                    {/* Selected Tickets */}
                    <div className="space-y-3 mb-6">
                      {Object.entries(selectedTickets).map(([ticketId, qty]) => {
                        const ticket = event.tickets.find((t) => t.id === ticketId);
                        if (!ticket) return null;

                        return (
                          <div
                            key={ticketId}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {qty}x {ticket.name}
                            </span>
                            <span className="font-medium">
                              {formatPrice(ticket.price * qty)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <hr className="border-gray-100 mb-4" />

                    {/* Subtotal */}
                    <div className="flex justify-between mb-6">
                      <span className="font-semibold text-gray-900">Subtotal</span>
                      <span className="font-bold text-xl text-[#E53935]">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-4">
                      * Los cargos por servicio se calcularán en el checkout
                    </p>

                    {/* Continue Button */}
                    <button
                      onClick={handleContinue}
                      className="w-full py-4 bg-[#E53935] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors"
                    >
                      Continuar al pago
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🎫</div>
                    <p className="text-gray-500 text-sm">
                      Selecciona al menos una boleta para continuar
                    </p>
                  </div>
                )}

                {/* Security Badge */}
                <div className="flex items-center gap-2 mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Compra 100% segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Fixed Footer */}
      {totalTickets > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">{totalTickets} boleta(s)</p>
              <p className="font-bold text-xl text-[#E53935]">
                {formatPrice(subtotal)}
              </p>
            </div>
            <button
              onClick={handleContinue}
              className="px-8 py-3 bg-[#E53935] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
