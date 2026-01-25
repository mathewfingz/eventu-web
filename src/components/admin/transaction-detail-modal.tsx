'use client';

import { useState } from 'react';
import {
  X,
  User,
  Calendar,
  CreditCard,
  Ticket,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';

interface Transaction {
  id: string;
  orderId: string;
  eventName: string;
  eventDate?: string;
  venueName?: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  fee: number;
  netAmount: number;
  subtotal?: number;
  taxesTotal?: number;
  method: 'CARD' | 'PSE' | 'NEQUI' | 'CASH' | 'DAVIPLATA' | 'EFECTY';
  paymentId?: string;
  status: TransactionStatus;
  createdAt: Date;
  paidAt?: Date;
  items?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface TransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onRefund?: (transactionId: string) => void;
}

const statusConfig: Record<
  TransactionStatus,
  { label: string; color: string; bgColor: string; icon: typeof CheckCircle }
> = {
  COMPLETED: {
    label: 'Completado',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
  },
  PENDING: {
    label: 'Pendiente',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: Clock,
  },
  FAILED: {
    label: 'Fallido',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Reembolsado',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: RefreshCw,
  },
};

const methodLabels: Record<string, { label: string; icon: string }> = {
  CARD: { label: 'Tarjeta de crédito/débito', icon: '💳' },
  PSE: { label: 'PSE - Débito bancario', icon: '🏦' },
  NEQUI: { label: 'Nequi', icon: '📱' },
  DAVIPLATA: { label: 'Daviplata', icon: '📲' },
  EFECTY: { label: 'Efecty', icon: '💵' },
  CASH: { label: 'Efectivo', icon: '💵' },
};

export function TransactionDetailModal({
  open,
  onClose,
  transaction,
  onRefund,
}: TransactionDetailModalProps) {
  const [refundLoading, setRefundLoading] = useState(false);

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
    if (!transaction || !onRefund) return;

    if (
      !confirm(
        '¿Estás seguro de que deseas reembolsar esta transacción? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    setRefundLoading(true);
    try {
      await onRefund(transaction.id);
    } finally {
      setRefundLoading(false);
    }
  };

  if (!open || !transaction) return null;

  const status = statusConfig[transaction.status];
  const StatusIcon = status.icon;
  const method = methodLabels[transaction.method] || {
    label: transaction.method,
    icon: '💰',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Detalle de transacción
            </h2>
            <p className="text-sm text-gray-500 font-mono mt-1">
              {transaction.orderId}
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
          {/* Status Badge */}
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
              {formatDate(transaction.createdAt)}
            </p>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
              <User className="w-4 h-4" />
              Cliente
            </h3>
            <div className="space-y-1">
              <p className="text-gray-900 font-medium">
                {transaction.customerName}
              </p>
              <p className="text-gray-500 text-sm">{transaction.customerEmail}</p>
            </div>
          </div>

          {/* Event Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4" />
              Evento
            </h3>
            <p className="text-gray-900 font-medium">{transaction.eventName}</p>
            {transaction.venueName && (
              <p className="text-gray-500 text-sm">{transaction.venueName}</p>
            )}
            {transaction.eventDate && (
              <p className="text-gray-500 text-sm">
                {new Date(transaction.eventDate).toLocaleDateString('es-CO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>

          {/* Items */}
          {transaction.items && transaction.items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                <Ticket className="w-4 h-4" />
                Tickets comprados
              </h3>
              <div className="space-y-2">
                {transaction.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4" />
              Método de pago
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xl">{method.icon}</span>
              <span className="text-gray-900">{method.label}</span>
            </div>
            {transaction.paymentId && (
              <p className="text-gray-500 text-sm mt-2 font-mono">
                ID: {transaction.paymentId}
              </p>
            )}
            {transaction.paidAt && (
              <p className="text-gray-500 text-sm mt-1">
                Pagado el {formatDate(transaction.paidAt)}
              </p>
            )}
          </div>

          {/* Amount Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4" />
              Desglose
            </h3>
            <div className="space-y-2">
              {transaction.subtotal !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    {formatCurrency(transaction.subtotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Comisión de servicio</span>
                <span className="text-gray-900">
                  {formatCurrency(transaction.fee)}
                </span>
              </div>
              {transaction.taxesTotal !== undefined &&
                transaction.taxesTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Impuestos</span>
                    <span className="text-gray-900">
                      {formatCurrency(transaction.taxesTotal)}
                    </span>
                  </div>
                )}
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-lg">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Neto para promotor</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(transaction.netAmount)}
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
                {formatDate(transaction.createdAt)}
              </p>
            </div>
            {transaction.status === 'COMPLETED' && transaction.paidAt && (
              <div className="relative">
                <div className="absolute -left-[1.35rem] top-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                <p className="text-sm font-medium text-gray-900">Pago confirmado</p>
                <p className="text-xs text-gray-500">
                  {formatDate(transaction.paidAt)}
                </p>
              </div>
            )}
            {transaction.status === 'FAILED' && (
              <div className="relative">
                <div className="absolute -left-[1.35rem] top-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                <p className="text-sm font-medium text-gray-900">Pago fallido</p>
                <p className="text-xs text-gray-500">
                  El pago no pudo ser procesado
                </p>
              </div>
            )}
            {transaction.status === 'REFUNDED' && (
              <div className="relative">
                <div className="absolute -left-[1.35rem] top-0 w-3 h-3 bg-purple-500 rounded-full border-2 border-white" />
                <p className="text-sm font-medium text-gray-900">Reembolsado</p>
                <p className="text-xs text-gray-500">
                  El pago fue reembolsado al cliente
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50">
          <div>
            {transaction.status === 'COMPLETED' && onRefund && (
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
