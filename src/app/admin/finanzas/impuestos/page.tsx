'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Receipt,
  Edit,
  Trash2,
  Plus,
  Info,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaxModal } from '@/components/admin/tax-modal';

interface Tax {
  id: string;
  name: string;
  code: string;
  percentage: number;
  description: string | null;
  isActive: boolean;
}

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);

  const fetchTaxes = async () => {
    try {
      const response = await fetch('/api/admin/taxes');
      const data = await response.json();
      if (response.ok) {
        setTaxes(data.taxes);
      }
    } catch (error) {
      console.error('Error fetching taxes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const toggleTaxActive = async (tax: Tax) => {
    setToggling(tax.id);
    try {
      const response = await fetch(`/api/admin/taxes/${tax.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !tax.isActive }),
      });

      if (response.ok) {
        fetchTaxes();
      }
    } catch (error) {
      console.error('Error toggling tax:', error);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este impuesto?')) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/taxes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTaxes();
      }
    } catch (error) {
      console.error('Error deleting tax:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (tax: Tax) => {
    setEditingTax(tax);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTax(null);
    setModalOpen(true);
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
            <h1 className="text-2xl font-bold text-gray-900">Impuestos</h1>
            <p className="text-gray-500 mt-1">
              Configura los impuestos y retenciones aplicables
            </p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo impuesto
        </button>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-medium">Importante</p>
          <p className="mt-1 text-yellow-700">
            Modificar la configuración de impuestos afecta todas las
            transacciones nuevas. Consulta con un contador antes de realizar
            cambios.
          </p>
        </div>
      </div>

      {/* Tax Configurations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#E53935]" />
            Configuración de Impuestos
          </h2>
        </div>

        {taxes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay impuestos configurados
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {taxes.map((tax) => (
              <div
                key={tax.id}
                className={cn('p-6', !tax.isActive && 'bg-gray-50')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{tax.name}</h3>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-mono rounded">
                        {tax.code}
                      </span>
                      {!tax.isActive && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {tax.description || 'Sin descripción'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-[#E53935]">
                      {tax.percentage}%
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(tax)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tax.id)}
                        disabled={deleting === tax.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      >
                        {deleting === tax.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Toggle */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {tax.isActive ? 'Impuesto activo' : 'Impuesto desactivado'}
                  </span>
                  <button
                    onClick={() => toggleTaxActive(tax)}
                    disabled={toggling === tax.id}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors disabled:opacity-50',
                      tax.isActive ? 'bg-green-500' : 'bg-gray-300'
                    )}
                  >
                    {toggling === tax.id ? (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                          tax.isActive ? 'left-7' : 'left-1'
                        )}
                      />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Sobre SAYCO y ACINPRO</p>
          <p className="mt-1 text-blue-700">
            Para eventos con música en vivo, los porcentajes de SAYCO (7.5%) y
            ACINPRO (7.5%) se calculan sobre el valor bruto de la boletería.
            Estos valores pueden variar según el tipo de evento y los acuerdos
            específicos con las entidades de gestión colectiva.
          </p>
        </div>
      </div>

      {/* Modal */}
      <TaxModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTax(null);
        }}
        onSuccess={fetchTaxes}
        tax={editingTax}
      />
    </div>
  );
}
