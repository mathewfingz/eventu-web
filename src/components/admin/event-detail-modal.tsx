'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Calendar,
  MapPin,
  User,
  Ticket,
  DollarSign,
  TrendingUp,
  Star,
  StarOff,
  Check,
  XCircle,
  Ban,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  date: string;
  doorsOpenAt: string | null;
  status: string;
  isFeatured: boolean;
  imageUrl: string | null;
  priceFrom: number;
  priceTo: number | null;
  venue: {
    id: string;
    name: string;
    city: string;
    address: string;
  };
  promoter: {
    id: string;
    name: string | null;
    email: string;
  };
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    totalQuantity: number;
    soldQuantity: number;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentMethod: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  stats: {
    totalTickets: number;
    soldTickets: number;
    availableTickets: number;
    soldPercentage: number;
    totalRevenue: number;
    totalOrders: number;
  };
}

interface EventDetailModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  eventId: string | null;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrador' },
  PENDING_APPROVAL: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' },
  APPROVED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Aprobado' },
  PUBLISHED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Publicado' },
  SOLD_OUT: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Agotado' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
  COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Finalizado' },
};

export function EventDetailModal({
  open,
  onClose,
  onUpdate,
  eventId,
}: EventDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && eventId) {
      fetchEvent();
    }
  }, [open, eventId]);

  const fetchEvent = async () => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar el evento');
      }

      setEvent(data.event);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!eventId) return;

    setActionLoading(action);

    try {
      let body = {};

      switch (action) {
        case 'approve':
          body = { status: 'APPROVED' };
          break;
        case 'publish':
          body = { status: 'PUBLISHED' };
          break;
        case 'reject':
          body = { status: 'DRAFT' };
          break;
        case 'cancel':
          body = { status: 'CANCELLED' };
          break;
        case 'feature':
          body = { isFeatured: true };
          break;
        case 'unfeature':
          body = { isFeatured: false };
          break;
      }

      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar');
      }

      fetchEvent();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl m-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalle del evento
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          ) : event ? (
            <div className="space-y-6">
              {/* Event Header */}
              <div className="flex gap-6">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {event.name}
                    </h3>
                    {event.isFeatured && (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        statusColors[event.status]?.bg,
                        statusColors[event.status]?.text
                      )}
                    >
                      {statusColors[event.status]?.label || event.status}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {event.category}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.venue.name} - {event.venue.city}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {event.promoter.name || event.promoter.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Ticket className="w-4 h-4" />
                    Tickets vendidos
                  </div>
                  <p className="text-xl font-bold">
                    {event.stats.soldTickets.toLocaleString()}
                    <span className="text-sm text-gray-400 font-normal">
                      /{event.stats.totalTickets.toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <TrendingUp className="w-4 h-4" />
                    % Vendido
                  </div>
                  <p className="text-xl font-bold text-[#E53935]">
                    {event.stats.soldPercentage}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    Ingresos
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(event.stats.totalRevenue)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Ticket className="w-4 h-4" />
                    Órdenes
                  </div>
                  <p className="text-xl font-bold">
                    {event.stats.totalOrders}
                  </p>
                </div>
              </div>

              {/* Ticket Types */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Tipos de tickets
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">
                          Tipo
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">
                          Precio
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">
                          Vendidos
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">
                          Disponibles
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">
                          % Vendido
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {event.ticketTypes.map((ticket) => {
                        const available =
                          ticket.totalQuantity - ticket.soldQuantity;
                        const percentage =
                          ticket.totalQuantity > 0
                            ? Math.round(
                                (ticket.soldQuantity / ticket.totalQuantity) *
                                  100
                              )
                            : 0;

                        return (
                          <tr key={ticket.id}>
                            <td className="px-4 py-3 font-medium">
                              {ticket.name}
                            </td>
                            <td className="px-4 py-3">
                              {formatCurrency(ticket.price)}
                            </td>
                            <td className="px-4 py-3">{ticket.soldQuantity}</td>
                            <td className="px-4 py-3">{available}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-[#E53935] h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-gray-500">
                                  {percentage}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Últimas órdenes
                </h4>
                {event.orders.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4 text-center bg-gray-50 rounded-lg">
                    No hay órdenes registradas
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                            Orden
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                            Cliente
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                            Método
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                            Total
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                            Fecha
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {event.orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-4 py-3 font-mono text-xs">
                              {order.orderNumber.slice(0, 8)}...
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">
                                  {order.user.name || 'Sin nombre'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.user.email}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {order.paymentMethod || '-'}
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {formatCurrency(order.total)}
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString(
                                'es-CO'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Actions Footer */}
        {event && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50">
            <div className="flex items-center gap-2">
              {event.status === 'PENDING_APPROVAL' && (
                <>
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === 'approve' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === 'reject' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Rechazar
                  </button>
                </>
              )}
              {event.status === 'APPROVED' && (
                <button
                  onClick={() => handleAction('publish')}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === 'publish' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Publicar
                </button>
              )}
              {['APPROVED', 'PUBLISHED'].includes(event.status) && (
                <button
                  onClick={() => handleAction('cancel')}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === 'cancel' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  Cancelar evento
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {event.isFeatured ? (
                <button
                  onClick={() => handleAction('unfeature')}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === 'unfeature' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <StarOff className="w-4 h-4" />
                  )}
                  Quitar destacado
                </button>
              ) : (
                <button
                  onClick={() => handleAction('feature')}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 border border-yellow-200 text-yellow-700 rounded-lg hover:bg-yellow-50 flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === 'feature' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )}
                  Destacar
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
