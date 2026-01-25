'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Smartphone,
  Building,
  Check,
  AlertCircle,
  RefreshCw,
  Settings,
  Copy,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentConfigModal } from '@/components/admin/payment-config-modal';

interface PaymentProvider {
  id: string;
  provider: string;
  name: string;
  isEnabled: boolean;
  isTestMode: boolean;
  status: 'connected' | 'error' | 'pending';
  lastTestedAt: string | null;
  stats: {
    transactions: number;
    volume: number;
    successRate: number;
  };
}

const providerIcons: Record<string, typeof CreditCard> = {
  NEQUI: Smartphone,
  MERCADOPAGO: CreditCard,
  COBRU: Building,
};

const providerColors: Record<string, string> = {
  NEQUI: 'bg-pink-500',
  MERCADOPAGO: 'bg-blue-500',
  COBRU: 'bg-green-500',
};

const providerDescriptions: Record<string, string> = {
  NEQUI: 'Pagos con QR y billetera digital',
  MERCADOPAGO: 'Tarjetas, PSE y efectivo',
  COBRU: 'PSE, Nequi, Daviplata y efectivo',
};

export default function PaymentSettingsPage() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/payment-config');
      const data = await response.json();

      if (response.ok) {
        setProviders(data.providers || []);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const toggleProvider = async (providerId: string, currentEnabled: boolean) => {
    try {
      const provider = providers.find((p) => p.id === providerId);
      if (!provider) return;

      const response = await fetch(`/api/admin/payment-config/${provider.provider}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !currentEnabled }),
      });

      if (response.ok) {
        fetchProviders();
      }
    } catch (error) {
      console.error('Error toggling provider:', error);
    }
  };

  const testConnection = async (provider: PaymentProvider) => {
    setTesting(provider.id);
    try {
      const response = await fetch(`/api/admin/payment-config/${provider.provider}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert(`Conexión exitosa: ${data.message}`);
      } else {
        alert(`Error: ${data.message || data.error}`);
      }

      fetchProviders();
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('Error al probar la conexión');
    } finally {
      setTesting(null);
    }
  };

  const openConfig = (provider: string) => {
    setSelectedProvider(provider);
    setShowConfigModal(true);
  };

  const copyWebhookUrl = (provider: string) => {
    const url = `${window.location.origin}/api/v1/webhooks/${provider.toLowerCase()}`;
    navigator.clipboard.writeText(url);
    setCopied(provider);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`;
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const enabledProviders = providers.filter((p) => p.isEnabled);
  const avgSuccessRate =
    enabledProviders.length > 0
      ? enabledProviders.reduce((sum, p) => sum + p.stats.successRate, 0) /
        enabledProviders.length
      : 0;
  const totalTransactions = providers.reduce(
    (sum, p) => sum + p.stats.transactions,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Métodos de Pago</h1>
          <p className="text-gray-500 mt-1">
            Configura las pasarelas de pago de la plataforma
          </p>
        </div>

        <button
          onClick={fetchProviders}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Actualizar
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Métodos activos</p>
          <p className="text-2xl font-bold mt-1">
            {enabledProviders.length}
            <span className="text-gray-400 text-lg font-normal">
              /{providers.length}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Transacciones (30d)</p>
          <p className="text-2xl font-bold mt-1">
            {totalTransactions.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Tasa de éxito promedio</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {avgSuccessRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Providers */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#E53935] animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => {
            const Icon = providerIcons[provider.provider] || CreditCard;
            const color = providerColors[provider.provider] || 'bg-gray-500';
            const description =
              providerDescriptions[provider.provider] || 'Pagos en línea';

            return (
              <div
                key={provider.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          color
                        )}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {provider.name}
                          </h3>
                          {provider.isTestMode && (
                            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                              Test
                            </span>
                          )}
                          {provider.status === 'connected' ? (
                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                              Conectado
                            </span>
                          ) : provider.status === 'error' ? (
                            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" />
                              Error
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                              <RefreshCw className="w-3 h-3" />
                              Pendiente
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                          {description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() =>
                        toggleProvider(provider.id, provider.isEnabled)
                      }
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        provider.isEnabled ? 'bg-[#E53935]' : 'bg-gray-200'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          provider.isEnabled ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>

                  {/* Stats */}
                  {provider.isEnabled && (
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                      <div>
                        <p className="text-sm text-gray-500">
                          Transacciones (30d)
                        </p>
                        <p className="font-semibold">
                          {provider.stats.transactions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Volumen (30d)</p>
                        <p className="font-semibold">
                          {formatCurrency(provider.stats.volume)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tasa de éxito</p>
                        <p
                          className={cn(
                            'font-semibold',
                            provider.stats.successRate >= 95
                              ? 'text-green-600'
                              : provider.stats.successRate >= 90
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          )}
                        >
                          {provider.stats.successRate}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Última prueba:{' '}
                    {provider.lastTestedAt
                      ? new Date(provider.lastTestedAt).toLocaleString('es-CO')
                      : 'Nunca'}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => testConnection(provider)}
                      disabled={testing === provider.id}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-white flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={cn(
                          'w-4 h-4',
                          testing === provider.id && 'animate-spin'
                        )}
                      />
                      Probar conexión
                    </button>
                    <button
                      onClick={() => openConfig(provider.provider)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-white flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Configurar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Webhook URLs */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">URLs de Webhook</h3>

        <div className="space-y-3">
          {['Nequi', 'MercadoPago', 'Cobru'].map((name) => (
            <div
              key={name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium">{name}</p>
                <code className="text-xs text-gray-500">
                  {typeof window !== 'undefined'
                    ? window.location.origin
                    : 'https://eventu.co'}
                  /api/v1/webhooks/{name.toLowerCase()}
                </code>
              </div>
              <button
                onClick={() => copyWebhookUrl(name)}
                className="text-sm text-[#E53935] hover:underline flex items-center gap-1"
              >
                {copied === name ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Config Modal */}
      <PaymentConfigModal
        open={showConfigModal}
        onClose={() => {
          setShowConfigModal(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
        onSave={fetchProviders}
      />
    </div>
  );
}
