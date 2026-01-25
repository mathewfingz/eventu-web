'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Key,
  Webhook,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  permissions: string[];
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  successRate: number;
}

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Producción - Backend',
    key: 'evnt_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 5 * 60 * 1000),
    permissions: ['read:events', 'write:events', 'read:orders', 'write:orders'],
  },
  {
    id: '2',
    name: 'Desarrollo - Testing',
    key: 'evnt_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
    permissions: ['read:events', 'read:orders'],
  },
];

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: '1',
    url: 'https://api.example.com/webhooks/eventu',
    events: ['order.completed', 'order.refunded', 'ticket.validated'],
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    lastTriggered: new Date(Date.now() - 15 * 60 * 1000),
    successRate: 99.2,
  },
  {
    id: '2',
    url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
    events: ['event.created', 'event.cancelled'],
    isActive: true,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    lastTriggered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    successRate: 100,
  },
];

const availableEvents = [
  { id: 'order.completed', label: 'Orden completada' },
  { id: 'order.refunded', label: 'Orden reembolsada' },
  { id: 'order.failed', label: 'Orden fallida' },
  { id: 'ticket.validated', label: 'Ticket validado' },
  { id: 'event.created', label: 'Evento creado' },
  { id: 'event.published', label: 'Evento publicado' },
  { id: 'event.cancelled', label: 'Evento cancelado' },
];

export default function IntegrationsPage() {
  const [apiKeys, setApiKeys] = useState(mockApiKeys);
  const [webhooks, setWebhooks] = useState(mockWebhooks);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleWebhook = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/configuracion"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API & Webhooks</h1>
          <p className="text-gray-500 mt-1">
            Gestiona las integraciones con sistemas externos
          </p>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Key className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
              <p className="text-sm text-gray-500">
                Claves de acceso para la API de Eventu
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors">
            <Plus className="w-4 h-4" />
            Nueva API Key
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{apiKey.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="px-3 py-1.5 bg-gray-100 rounded font-mono text-sm">
                      {showKey === apiKey.id
                        ? apiKey.key
                        : apiKey.key.replace(/(.{10}).*(.{4})/, '$1...$2')}
                    </code>
                    <button
                      onClick={() =>
                        setShowKey(showKey === apiKey.id ? null : apiKey.id)
                      }
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                    >
                      {showKey === apiKey.id ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                    >
                      {copiedId === apiKey.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>
                      Creada {format(apiKey.createdAt, "d MMM yyyy", { locale: es })}
                    </span>
                    {apiKey.lastUsed && (
                      <span>
                        Último uso{' '}
                        {format(apiKey.lastUsed, "d MMM HH:mm", { locale: es })}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {apiKey.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Webhook className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Webhooks</h2>
              <p className="text-sm text-gray-500">
                Recibe notificaciones en tiempo real
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors">
            <Plus className="w-4 h-4" />
            Nuevo Webhook
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-gray-900">
                      {webhook.url}
                    </code>
                    <a
                      href={webhook.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {event}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    {webhook.lastTriggered && (
                      <span>
                        Último trigger{' '}
                        {format(webhook.lastTriggered, "d MMM HH:mm", { locale: es })}
                      </span>
                    )}
                    <span
                      className={cn(
                        'font-medium',
                        webhook.successRate >= 99
                          ? 'text-green-600'
                          : webhook.successRate >= 95
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      )}
                    >
                      {webhook.successRate}% éxito
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWebhook(webhook.id)}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      webhook.isActive ? 'bg-green-500' : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                        webhook.isActive ? 'left-7' : 'left-1'
                      )}
                    />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation Link */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">Documentación de la API</h3>
            <p className="text-sm text-gray-600 mt-1">
              Consulta la documentación completa de la API para integrar Eventu con
              tus sistemas.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-[#E53935] font-medium text-sm mt-2 hover:underline"
            >
              Ver documentación
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
