'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Ticket,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  emailVerified: string | null;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  totalOrders: number;
  totalTickets: number;
  totalSpent: number;
  eventsAttended: number;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
  event: {
    id: string;
    name: string;
    date: string;
    venue: {
      name: string;
      city: string;
    };
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    ticketType: {
      name: string;
    };
  }>;
}

interface ClientDetailModalProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PROCESSING: { label: 'Procesando', color: 'bg-blue-100 text-blue-700', icon: Clock },
  PAID: { label: 'Pagado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: XCircle },
  REFUNDED: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  EXPIRED: { label: 'Expirado', color: 'bg-gray-100 text-gray-500', icon: Clock },
};

export function ClientDetailModal({
  open,
  onClose,
  userId,
}: ClientDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId) {
      fetchUserData();
    }
  }, [open, userId]);

  const fetchUserData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/orders`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar el usuario');
      }

      setUser(data.user);
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
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
            Detalle del cliente
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
          ) : user ? (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">
                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {user.name || 'Sin nombre'}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {user.email}
                      {user.emailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                          No verificado
                        </span>
                      )}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                        {user.phoneVerified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      Registrado el {formatDate(user.createdAt)}
                    </div>
                    {user.lastLoginAt && (
                      <div className="text-gray-500 text-sm">
                        Último acceso: {formatDateTime(user.lastLoginAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <ShoppingBag className="w-4 h-4" />
                    Órdenes
                  </div>
                  <p className="text-xl font-bold">{user.totalOrders}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Ticket className="w-4 h-4" />
                    Tickets
                  </div>
                  <p className="text-xl font-bold">{user.totalTickets}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    Total gastado
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(user.totalSpent)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    Eventos
                  </div>
                  <p className="text-xl font-bold">{user.eventsAttended}</p>
                </div>
              </div>

              {/* Orders History */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Historial de compras
                </h4>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-sm py-8 text-center bg-gray-50 rounded-lg">
                    Este cliente no tiene órdenes registradas
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">
                            Orden
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">
                            Evento
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">
                            Tickets
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">
                            Fecha
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => {
                          const status = statusConfig[order.status] || statusConfig.PENDING;
                          const StatusIcon = status.icon;
                          const ticketCount = order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          );

                          return (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <span className="font-mono text-xs">
                                  {order.orderNumber.slice(0, 8)}...
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {order.event.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {order.event.venue.name} -{' '}
                                    {formatDate(order.event.date)}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium">{ticketCount}</p>
                                  <p className="text-xs text-gray-500">
                                    {order.items
                                      .map((i) => `${i.quantity}x ${i.ticketType.name}`)
                                      .join(', ')}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {formatCurrency(order.total)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                                    status.color
                                  )}
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {formatDate(order.createdAt)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end flex-shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
