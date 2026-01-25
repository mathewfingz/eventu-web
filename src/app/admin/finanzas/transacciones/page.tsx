'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TransactionDetailModal } from '@/components/admin/transaction-detail-modal';

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

const statusConfig: Record<TransactionStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  FAILED: { label: 'Fallido', color: 'bg-red-100 text-red-700', icon: XCircle },
  REFUNDED: { label: 'Reembolsado', color: 'bg-purple-100 text-purple-700', icon: RefreshCw },
};

const methodLabels: Record<string, string> = {
  CARD: 'Tarjeta',
  PSE: 'PSE',
  NEQUI: 'Nequi',
  DAVIPLATA: 'Daviplata',
  EFECTY: 'Efecty',
  CASH: 'Efectivo',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (methodFilter !== 'all') params.set('method', methodFilter);
      params.set('page', meta.page.toString());

      const response = await fetch(`/api/admin/transactions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions || []);
        setMeta(data.meta || { total: 0, page: 1, totalPages: 1 });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, methodFilter, meta.page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchTransactions]);

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleRefund = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}/refund`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchTransactions();
        setShowDetailModal(false);
      } else {
        const data = await response.json();
        alert(data.error || 'Error al procesar el reembolso');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Error al procesar el reembolso');
    }
  };

  const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  const totalFees = transactions.reduce((sum, txn) => sum + txn.fee, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/finanzas"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
            <p className="text-gray-500 mt-1">
              Historial de todas las transacciones de la plataforma
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Actualizar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total transacciones</p>
          <p className="text-2xl font-bold text-gray-900">
            {meta.total}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Monto total</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(totalAmount)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Comisiones</p>
          <p className="text-2xl font-bold text-green-600">
            {formatPrice(totalFees)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por orden, cliente o evento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
          >
            <option value="all">Todos los estados</option>
            <option value="COMPLETED">Completados</option>
            <option value="PENDING">Pendientes</option>
            <option value="FAILED">Fallidos</option>
            <option value="REFUNDED">Reembolsados</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
          >
            <option value="all">Todos los métodos</option>
            <option value="CARD">Tarjeta</option>
            <option value="PSE">PSE</option>
            <option value="NEQUI">Nequi</option>
            <option value="DAVIPLATA">Daviplata</option>
            <option value="EFECTY">Efecty</option>
            <option value="CASH">Efectivo</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#E53935] animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron transacciones</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((txn) => {
                  const StatusIcon = statusConfig[txn.status].icon;
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">
                          {txn.orderId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">
                            {txn.customerName}
                          </p>
                          <p className="text-sm text-gray-500">{txn.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 line-clamp-1">
                          {txn.eventName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600">
                          {methodLabels[txn.method] || txn.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatPrice(txn.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Fee: {formatPrice(txn.fee)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                            statusConfig[txn.status].color
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[txn.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(txn.createdAt), "d MMM HH:mm", { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetail(txn)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {transactions.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Mostrando {transactions.length} de {meta.total} transacciones
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMeta({ ...meta, page: meta.page - 1 })}
                disabled={meta.page <= 1}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {meta.page} de {meta.totalPages}
              </span>
              <button
                onClick={() => setMeta({ ...meta, page: meta.page + 1 })}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onRefund={handleRefund}
      />
    </div>
  );
}
