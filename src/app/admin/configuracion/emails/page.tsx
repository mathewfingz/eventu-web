'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Eye,
  Edit,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  subject: string;
  lastModified: Date;
  isActive: boolean;
}

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Confirmación de compra',
    slug: 'purchase-confirmation',
    description: 'Se envía cuando un usuario completa una compra exitosa',
    subject: '¡Tu compra está confirmada! - {{event_name}}',
    lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '2',
    name: 'Boletas digitales',
    slug: 'tickets-delivery',
    description: 'Envía las boletas digitales con códigos QR',
    subject: 'Tus boletas para {{event_name}}',
    lastModified: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '3',
    name: 'Recordatorio de evento',
    slug: 'event-reminder',
    description: 'Recordatorio 24 horas antes del evento',
    subject: '¡Mañana es el día! - {{event_name}}',
    lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '4',
    name: 'Reembolso procesado',
    slug: 'refund-processed',
    description: 'Notificación cuando se procesa un reembolso',
    subject: 'Tu reembolso ha sido procesado',
    lastModified: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '5',
    name: 'Bienvenida',
    slug: 'welcome',
    description: 'Email de bienvenida para nuevos usuarios',
    subject: '¡Bienvenido a Eventu!',
    lastModified: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '6',
    name: 'Recuperar contraseña',
    slug: 'password-reset',
    description: 'Email con enlace para restablecer contraseña',
    subject: 'Restablece tu contraseña',
    lastModified: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '7',
    name: 'Evento cancelado',
    slug: 'event-cancelled',
    description: 'Notificación cuando un evento es cancelado',
    subject: 'Información importante: {{event_name}} ha sido cancelado',
    lastModified: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    isActive: false,
  },
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState(mockTemplates);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copySlug = (slug: string, id: string) => {
    navigator.clipboard.writeText(`{{template:${slug}}}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleActive = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
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
          <h1 className="text-2xl font-bold text-gray-900">Templates de Email</h1>
          <p className="text-gray-500 mt-1">
            Personaliza los emails transaccionales de la plataforma
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Variables disponibles</p>
          <p className="mt-1 text-blue-700">
            Usa variables como <code className="bg-blue-100 px-1 rounded">{'{{event_name}}'}</code>,{' '}
            <code className="bg-blue-100 px-1 rounded">{'{{user_name}}'}</code>,{' '}
            <code className="bg-blue-100 px-1 rounded">{'{{order_id}}'}</code> en tus templates.
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={cn(
              'bg-white rounded-xl shadow-sm border overflow-hidden',
              template.isActive ? 'border-gray-100' : 'border-gray-200 bg-gray-50'
            )}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'p-3 rounded-lg',
                      template.isActive ? 'bg-[#E53935]/10' : 'bg-gray-100'
                    )}
                  >
                    <Mail
                      className={cn(
                        'w-5 h-5',
                        template.isActive ? 'text-[#E53935]' : 'text-gray-400'
                      )}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          'font-semibold',
                          template.isActive ? 'text-gray-900' : 'text-gray-500'
                        )}
                      >
                        {template.name}
                      </h3>
                      {!template.isActive && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                          Desactivado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {template.description}
                    </p>

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Asunto:</p>
                      <p className="text-sm font-mono text-gray-700">
                        {template.subject}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <button
                        onClick={() => copySlug(template.slug, template.id)}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        {copiedId === template.id ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-green-600">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="font-mono">{template.slug}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Vista previa</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Editar</span>
                  </button>
                  <button
                    onClick={() => toggleActive(template.id)}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      template.isActive ? 'bg-green-500' : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                        template.isActive ? 'left-7' : 'left-1'
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
