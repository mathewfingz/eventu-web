'use client';

import { useState } from 'react';
import {
  Send,
  Mail,
  Bell,
  Users,
  Calendar,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type NotificationType = 'EMAIL' | 'PUSH' | 'SMS';
type NotificationStatus = 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED';

interface Notification {
  id: string;
  title: string;
  type: NotificationType;
  status: NotificationStatus;
  audience: string;
  audienceCount: number;
  sentAt?: Date;
  scheduledFor?: Date;
  openRate?: number;
}

const typeConfig: Record<NotificationType, { label: string; icon: typeof Mail; color: string }> = {
  EMAIL: { label: 'Email', icon: Mail, color: 'bg-blue-100 text-blue-600' },
  PUSH: { label: 'Push', icon: Bell, color: 'bg-purple-100 text-purple-600' },
  SMS: { label: 'SMS', icon: Send, color: 'bg-green-100 text-green-600' },
};

const statusConfig: Record<NotificationStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  SCHEDULED: { label: 'Programado', color: 'bg-yellow-100 text-yellow-700' },
  SENT: { label: 'Enviado', color: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Fallido', color: 'bg-red-100 text-red-700' },
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Recordatorio: Bad Bunny mañana',
    type: 'EMAIL',
    status: 'SENT',
    audience: 'Compradores de Bad Bunny',
    audienceCount: 45000,
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    openRate: 68.5,
  },
  {
    id: '2',
    title: 'Últimas boletas disponibles',
    type: 'PUSH',
    status: 'SENT',
    audience: 'Usuarios con favorito Karol G',
    audienceCount: 12300,
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    openRate: 42.1,
  },
  {
    id: '3',
    title: 'Preventa exclusiva Festival',
    type: 'EMAIL',
    status: 'SCHEDULED',
    audience: 'Suscriptores newsletter',
    audienceCount: 85000,
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Confirmación de compra',
    type: 'EMAIL',
    status: 'DRAFT',
    audience: 'Template automático',
    audienceCount: 0,
  },
];

export default function CommunicationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || notif.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    totalSent: notifications.filter((n) => n.status === 'SENT').length,
    scheduled: notifications.filter((n) => n.status === 'SCHEDULED').length,
    avgOpenRate:
      notifications
        .filter((n) => n.openRate)
        .reduce((sum, n) => sum + (n.openRate || 0), 0) /
        notifications.filter((n) => n.openRate).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comunicaciones</h1>
          <p className="text-gray-500 mt-1">
            Gestiona notificaciones y campañas de email
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva notificación
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Enviadas</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalSent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Programadas</p>
              <p className="text-xl font-bold text-gray-900">{stats.scheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tasa de apertura</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.avgOpenRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Alcance total</p>
              <p className="text-xl font-bold text-gray-900">
                {notifications
                  .reduce((sum, n) => sum + n.audienceCount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar notificaciones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                typeFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Todos
            </button>
            {Object.entries(typeConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  typeFilter === key
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredNotifications.map((notification) => {
            const TypeIcon = typeConfig[notification.type].icon;

            return (
              <div
                key={notification.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        typeConfig[notification.type].color
                      )}
                    >
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            statusConfig[notification.status].color
                          )}
                        >
                          {statusConfig[notification.status].label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {notification.audience}
                          {notification.audienceCount > 0 &&
                            ` (${notification.audienceCount.toLocaleString()})`}
                        </span>

                        {notification.sentAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Enviado {format(notification.sentAt, "d MMM HH:mm", { locale: es })}
                          </span>
                        )}

                        {notification.scheduledFor && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Programado {format(notification.scheduledFor, "d MMM HH:mm", { locale: es })}
                          </span>
                        )}

                        {notification.openRate !== undefined && (
                          <span className="text-green-600 font-medium">
                            {notification.openRate}% apertura
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    {notification.status === 'DRAFT' && (
                      <>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron notificaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}
