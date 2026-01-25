'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Key,
  Shield,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentConfigModalProps {
  open: boolean;
  onClose: () => void;
  provider: string | null;
  onSave: () => void;
}

interface ProviderCredentials {
  // Nequi
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  webhookSecret?: string;
  // MercadoPago
  accessToken?: string;
  publicKey?: string;
  // Cobru
  secretKey?: string;
}

const providerFields: Record<string, Array<{ key: string; label: string; required: boolean }>> = {
  NEQUI: [
    { key: 'clientId', label: 'Client ID', required: true },
    { key: 'clientSecret', label: 'Client Secret', required: true },
    { key: 'apiKey', label: 'API Key', required: false },
    { key: 'webhookSecret', label: 'Webhook Secret', required: false },
  ],
  MERCADOPAGO: [
    { key: 'accessToken', label: 'Access Token', required: true },
    { key: 'publicKey', label: 'Public Key', required: true },
    { key: 'webhookSecret', label: 'Webhook Secret', required: false },
  ],
  COBRU: [
    { key: 'apiKey', label: 'API Key', required: true },
    { key: 'secretKey', label: 'Secret Key', required: true },
    { key: 'webhookSecret', label: 'Webhook Secret', required: false },
  ],
};

const providerNames: Record<string, string> = {
  NEQUI: 'Nequi',
  MERCADOPAGO: 'MercadoPago',
  COBRU: 'Cobru',
};

export function PaymentConfigModal({
  open,
  onClose,
  provider,
  onSave,
}: PaymentConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [credentials, setCredentials] = useState<ProviderCredentials>({});
  const [isEnabled, setIsEnabled] = useState(false);
  const [isTestMode, setIsTestMode] = useState(true);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open && provider) {
      fetchConfig();
    }
  }, [open, provider]);

  const fetchConfig = async () => {
    if (!provider) return;
    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch(`/api/admin/payment-config/${provider}`);
      const data = await response.json();

      if (response.ok && data.config) {
        setCredentials(data.config.credentials || {});
        setIsEnabled(data.config.isEnabled || false);
        setIsTestMode(data.config.isTestMode ?? true);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!provider) return;
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/payment-config/${provider}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentials,
          isEnabled,
          isTestMode,
        }),
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!provider) return;
    setTesting(true);
    setTestResult(null);

    try {
      // First save the credentials
      await fetch(`/api/admin/payment-config/${provider}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentials,
          isEnabled,
          isTestMode,
        }),
      });

      // Then test
      const response = await fetch(`/api/admin/payment-config/${provider}`, {
        method: 'POST',
      });

      const data = await response.json();
      setTestResult({
        success: data.success,
        message: data.message || data.error,
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult({
        success: false,
        message: 'Error al probar la conexión',
      });
    } finally {
      setTesting(false);
    }
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!open || !provider) return null;

  const fields = providerFields[provider] || [];
  const providerName = providerNames[provider] || provider;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg m-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Configurar {providerName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa las credenciales de API
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
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#E53935] animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mode Toggle */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Modo de prueba</p>
                    <p className="text-sm text-gray-500">
                      {isTestMode
                        ? 'Usando ambiente de sandbox'
                        : 'Usando ambiente de producción'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsTestMode(!isTestMode)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      isTestMode ? 'bg-yellow-500' : 'bg-green-500'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        isTestMode ? 'translate-x-1' : 'translate-x-6'
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Credentials Fields */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Credenciales
                </h3>

                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets[field.key] ? 'text' : 'password'}
                        value={credentials[field.key as keyof ProviderCredentials] || ''}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            [field.key]: e.target.value,
                          })
                        }
                        placeholder={`Ingresa ${field.label.toLowerCase()}`}
                        className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret(field.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSecrets[field.key] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enable Toggle */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Habilitar {providerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Permite pagos a través de {providerName}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      isEnabled ? 'bg-[#E53935]' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Test Result */}
              {testResult && (
                <div
                  className={cn(
                    'p-4 rounded-lg flex items-start gap-3',
                    testResult.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  )}
                >
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <p
                    className={cn(
                      'text-sm',
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    )}
                  >
                    {testResult.message}
                  </p>
                </div>
              )}

              {/* Security Note */}
              <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Seguridad
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Las credenciales se almacenan de forma encriptada y no se
                    muestran en texto plano.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50">
          <button
            onClick={handleTest}
            disabled={testing || loading}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-white flex items-center gap-2 disabled:opacity-50"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            Probar conexión
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
