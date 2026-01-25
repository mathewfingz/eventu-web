'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

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

interface CommissionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  commission?: Commission | null;
}

const paymentMethods = [
  { value: 'CARD', label: 'Tarjeta de crédito/débito' },
  { value: 'PSE', label: 'PSE' },
  { value: 'NEQUI', label: 'Nequi' },
  { value: 'DAVIPLATA', label: 'Daviplata' },
  { value: 'EFECTY', label: 'Efecty' },
  { value: 'BALOTO', label: 'Baloto' },
];

export function CommissionModal({
  open,
  onClose,
  onSuccess,
  commission,
}: CommissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'VOLUME' as CommissionType,
    minVolume: '',
    maxVolume: '',
    percentage: '',
    fixedFee: '',
    paymentMethod: '',
  });

  const isEditing = !!commission;

  useEffect(() => {
    if (commission) {
      setFormData({
        name: commission.name,
        type: commission.type,
        minVolume: commission.minVolume?.toString() || '',
        maxVolume: commission.maxVolume?.toString() || '',
        percentage: commission.percentage.toString(),
        fixedFee: commission.fixedFee.toString(),
        paymentMethod: commission.paymentMethod || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'VOLUME',
        minVolume: '',
        maxVolume: '',
        percentage: '',
        fixedFee: '',
        paymentMethod: '',
      });
    }
    setError(null);
  }, [commission, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isEditing
        ? `/api/admin/commissions/${commission.id}`
        : '/api/admin/commissions';

      const method = isEditing ? 'PATCH' : 'POST';

      const body = {
        name: formData.name,
        type: formData.type,
        percentage: formData.percentage,
        fixedFee: formData.fixedFee || '0',
        ...(formData.type === 'VOLUME' && {
          minVolume: formData.minVolume ? parseInt(formData.minVolume) : null,
          maxVolume: formData.maxVolume ? parseInt(formData.maxVolume) : null,
        }),
        ...(formData.type === 'PAYMENT_METHOD' && {
          paymentMethod: formData.paymentMethod,
        }),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar la comisión');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar comisión' : 'Nueva comisión'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Básico, Premium, Tarjeta..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de comisión <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as CommissionType,
                })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
              disabled={isEditing}
            >
              <option value="VOLUME">Por volumen de ventas</option>
              <option value="PAYMENT_METHOD">Por método de pago</option>
            </select>
          </div>

          {formData.type === 'VOLUME' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volumen mínimo (COP)
                </label>
                <input
                  type="number"
                  value={formData.minVolume}
                  onChange={(e) =>
                    setFormData({ ...formData, minVolume: e.target.value })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volumen máximo (COP)
                </label>
                <input
                  type="number"
                  value={formData.maxVolume}
                  onChange={(e) =>
                    setFormData({ ...formData, maxVolume: e.target.value })
                  }
                  placeholder="Sin límite"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                />
              </div>
            </div>
          )}

          {formData.type === 'PAYMENT_METHOD' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de pago <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                required={formData.type === 'PAYMENT_METHOD'}
              >
                <option value="">Seleccionar método</option>
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.percentage}
                onChange={(e) =>
                  setFormData({ ...formData, percentage: e.target.value })
                }
                placeholder="10"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo fijo (COP)
              </label>
              <input
                type="number"
                min="0"
                value={formData.fixedFee}
                onChange={(e) =>
                  setFormData({ ...formData, fixedFee: e.target.value })
                }
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear comisión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
