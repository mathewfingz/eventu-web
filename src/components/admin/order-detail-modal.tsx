'use client';

import { useState } from 'react';
import {
  X,
  User,
  Calendar,
  MapPin,
  CreditCard,
  Ticket,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Loader2,
  Mail,
  Phone,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventName: string;
  eventDate?: string;
  venueName?: string;
  venueAddress?: string;
  total: number;
  subtotal: number;
  fees: number;
  taxes: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  paymentId?: string;
  createdAt: Date;
  paidAt?: Date;
  ticketCount: number;
  items: OrderItem[];
}

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onRefund?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: typeof CheckCircle }
> = {
  PENDING: {
    label: 'Pendiente',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmada',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: CheckCircle,
  },
  COMPLETED: {
    label: 'Completada',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelada',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Reembolsada',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: RefreshCw,
  },
};

const paymentMethodLabels: Record<string, { label: string; icon: string }> = {
  CARD: { label: 'Tarjeta de crédito/débito', icon: '💳' },
  PSE: { label: 'PSE - Débito bancario', icon: '🏦' },
  NEQUI: { label: 'Nequi', icon: '📱' },
  DAVIPLATA: { label: 'Daviplata', icon: '📲' },
  EFECTY: { label: 'Efecty', icon: '💵' },
  CASH: { label: 'Efectivo', icon: '💵' },
};

export function OrderDetailModal({
  open,
  onClose,
  order,
  onRefund,
  onCancel,
}: OrderDetailModalProps) {
  const [refundLoading, setRefundLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRefund = async () => {
    if (!order || !onRefund) return;

    if (
      !confirm(
        '¿Estás seguro de que deseas reembolsar esta orden? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    setRefundLoading(true);
    try {
      await onRefund(order.id);
    } finally {
      setRefundLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !onCancel) return;

    if (
      !confirm(
        '¿Estás seguro de que deseas cancelar esta orden?'
      )
    ) {
      return;
    }

    setCancelLoading(true);
    try {
      await onCancel(order.id);
    } finally {
      setCancelLoading(false);
    }
  };

  if (!open || !order) return null;

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const paymentMethod = order.paymentMethod
    ? paymentMethodLabels[order.paymentMethod] || {
        label: order.paymentMethod,
        icon: '💰',
      }
    : null;

  const canRefund =
    order.status === 'COMPLETED' || order.status === 'CONFIRMED';
  const canCancel = order.status === 'PENDING';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl m-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Detalle de orden
            </h2>
            <p className="text-sm text-gray-500 font-mono mt-1">
              {order.orderNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Status and Date */}
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                status.bgColor,
                status.color
              )}
            >
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </span>
            <p className="text-sm text-gray-500">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                <User className="w-4 h-4" />
                Cliente
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">
                  {order.customerName}
                </p>
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  {order.customerEmail}
                </p>
                {order.customerPhone && (
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {order.customerPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Event Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4" />
                Evento
              </h3>
              <p className="text-gray-900 font-medium">{order.eventName}</p>
              {order.venueName && (
                <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3" />
                  {order.venueName}
                </p>
              )}
              {order.eventDate && (
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(order.eventDate).toLocaleDateString('es-CO', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
              <Ticket className="w-4 h-4" />
              Tickets ({order.ticketCount})
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E53935]/10 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#E53935]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          {paymentMethod && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4" />
                Método de pago
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xl">{paymentMethod.icon}</span>
                <span className="text-gray-900">{paymentMethod.label}</span>
              </div>
              {order.paymentId && (
                <p className="text-gray-500 text-sm mt-2 font-mono">
                  ID: {order.paymentId}
                </p>
              )}
              {order.paidAt && (
                <p className="text-gray-500 text-sm mt-1">
                  Pagado el {formatDate(order.paidAt)}
                </p>
              )}
            </div>
          )}

          {/* Amount Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4" />
              Desglose de pago
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              {order.fees > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Comisión de servicio</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.fees)}
                  </span>
                </div>
              )}
              {order.taxes > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Impuestos</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.taxes)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-lg">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-l-2 border-gray-200 pl-4 space-y-4">
            <div className="relative">
              <div className="absolute -left-[1.35rem] top-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              <p className="text-sm font-medium text-gray-900">Orden creada</p>
              <p className="text-xs text-gray-500">
                {formatDate(order.createdAt)}
              </p>
            </div>
            {order.paidAt && (
              <div className="relative">
                <div className="absolute -left-[1.35rem] top-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                <p className="text-sm font-medium text-gray-900">
                  Pago confirmado
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(order.paidAt)}
                </p>
              </div>
            )}
            {order.status === 'CANCELLED' && (
              <div className="relative">
                <div className="absolute -left-[1.35rem] top-0 w-3 h-3 bg-gray-500 rounded-full border-2 border-white" />
                <p className="text-sm font-medium text-gray-900">
                  Orden cancelada
                </p>
              </div>
            )}
            {order.status === 'REFUNDED' && (
              <div className="relative">
                <div className="absolute -left-[1.35rem] top-0 w-3 h-3 bg-purple-500 rounded-full border-2 border-white" />
                <p className="text-sm font-medium text-gray-900">
                  Orden reembolsada
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50">
          <div className="flex items-center gap-2">
            {canCancel && onCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
              >
                {cancelLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancelar orden
              </button>
            )}
            {canRefund && onRefund && (
              <button
                onClick={handleRefund}
                disabled={refundLoading}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
              >
                {refundLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Reembolsar
              </button>
            )}
          </div>
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
