'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Percent,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Info,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommissionModal } from '@/components/admin/commission-modal';

type CommissionType = 'VOLUME' | 'PAYMENT_METHOD';

interface Commission {
  id: string;
  name: string;
  type: CommissionType;
  minVolume: number | null;
  maxVolume: number | null;
  percentage: number;
  fixedFee: number;
  paymentMethod: string | null;
  isActive: boolean;
}

const paymentMethodLabels: Record<string, { label: string; icon: string }> = {
  CARD: { label: 'Tarjeta de crédito/débito', icon: '💳' },
  PSE: { label: 'PSE', icon: '🏦' },
  NEQUI: { label: 'Nequi', icon: '📱' },
  DAVIPLATA: { label: 'Daviplata', icon: '📲' },
  EFECTY: { label: 'Efecty', icon: '💵' },
  BALOTO: { label: 'Baloto', icon: '🎫' },
};

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(
    null
  );

  const volumeCommissions = commissions.filter((c) => c.type === 'VOLUME');
  const paymentCommissions = commissions.filter(
    (c) => c.type === 'PAYMENT_METHOD'
  );

  const fetchCommissions = async () => {
    try {
      const response = await fetch('/api/admin/commissions');
      const data = await response.json();
      if (response.ok) {
        setCommissions(data.commissions);
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta comisión?')) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/commissions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCommissions();
      }
    } catch (error) {
      console.error('Error deleting commission:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (commission: Commission) => {
    setEditingCommission(commission);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCommission(null);
    setModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Comisiones</h1>
            <p className="text-gray-500 mt-1">
              Configura las comisiones por volumen y método de pago
            </p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva comisión
        </button>
      </div>

      {/* Commission Tiers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Percent className="w-5 h-5 text-[#E53935]" />
            Comisiones por Volumen de Ventas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Comisiones base aplicadas según el volumen mensual del organizador
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rango de Volumen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo Fijo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {volumeCommissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay comisiones por volumen configuradas
                  </td>
                </tr>
              ) : (
                volumeCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {commission.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {commission.minVolume !== null
                        ? formatCurrency(commission.minVolume)
                        : '$0'}{' '}
                      -{' '}
                      {commission.maxVolume !== null
                        ? formatCurrency(commission.maxVolume)
                        : 'Sin límite'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-[#E53935]">
                        {commission.percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-600">
                        ${commission.fixedFee.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          commission.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {commission.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(commission)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(commission.id)}
                          disabled={deleting === commission.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                          {deleting === commission.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Method Commissions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#E53935]" />
            Comisiones por Método de Pago
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Cargos adicionales según el método de pago utilizado
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentCommissions.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-gray-500">
              No hay comisiones por método de pago configuradas
            </div>
          ) : (
            paymentCommissions.map((commission) => {
              const methodInfo = commission.paymentMethod
                ? paymentMethodLabels[commission.paymentMethod]
                : null;

              return (
                <div
                  key={commission.id}
                  className={cn(
                    'flex items-center justify-between p-4 border rounded-lg',
                    commission.isActive
                      ? 'border-gray-200'
                      : 'border-gray-100 bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {methodInfo?.icon || '💰'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {commission.name}
                        </p>
                        {!commission.isActive && (
                          <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {commission.percentage}% + $
                        {commission.fixedFee.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(commission)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(commission.id)}
                      disabled={deleting === commission.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    >
                      {deleting === commission.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Cómo se calculan las comisiones</p>
          <p className="mt-1 text-blue-700">
            La comisión total = (Comisión por volumen % × Subtotal) + Cargo fijo
            + (Comisión método de pago % × Total) + Cargo fijo método de pago.
            Las comisiones se calculan sobre el monto neto de cada transacción.
          </p>
        </div>
      </div>

      {/* Modal */}
      <CommissionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCommission(null);
        }}
        onSuccess={fetchCommissions}
        commission={editingCommission}
      />
    </div>
  );
}
