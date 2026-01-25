'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Building,
  CreditCard,
  Bell,
  Users,
  Shield,
  Save,
  Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile' | 'organization' | 'banking' | 'notifications' | 'team';

const tabs = [
  { id: 'profile' as SettingsTab, label: 'Perfil', icon: User },
  { id: 'organization' as SettingsTab, label: 'Organización', icon: Building },
  { id: 'banking' as SettingsTab, label: 'Datos bancarios', icon: CreditCard },
  { id: 'notifications' as SettingsTab, label: 'Notificaciones', icon: Bell },
  { id: 'team' as SettingsTab, label: 'Equipo', icon: Users },
];

export default function OrganizerSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Mock form data
  const [profileData, setProfileData] = useState({
    name: 'Juan Organizador',
    email: 'juan@eventosco.com',
    phone: '+57 300 123 4567',
  });

  const [orgData, setOrgData] = useState({
    name: 'EventosCO',
    nit: '900.123.456-7',
    address: 'Carrera 15 #93-47, Bogotá',
    website: 'https://eventosco.com',
    description: 'Somos una empresa dedicada a la producción de eventos de alta calidad.',
  });

  const [bankData, setBankData] = useState({
    bankName: 'Bancolombia',
    accountType: 'Ahorros',
    accountNumber: '****4567',
    accountHolder: 'EventosCO S.A.S',
  });

  const [notifications, setNotifications] = useState({
    emailSales: true,
    emailSettlements: true,
    pushSales: false,
    pushReminders: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/organizer"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
                <p className="text-sm text-gray-500">
                  Administra tu cuenta de organizador
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar cambios
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                      activeTab === tab.id
                        ? 'bg-[#E53935]/10 text-[#E53935]'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Información personal
                </h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Camera className="w-4 h-4" />
                    Cambiar foto
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === 'organization' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Datos de la organización
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la empresa
                    </label>
                    <input
                      type="text"
                      value={orgData.name}
                      onChange={(e) =>
                        setOrgData({ ...orgData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIT
                    </label>
                    <input
                      type="text"
                      value={orgData.nit}
                      onChange={(e) =>
                        setOrgData({ ...orgData, nit: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={orgData.address}
                      onChange={(e) =>
                        setOrgData({ ...orgData, address: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sitio web
                    </label>
                    <input
                      type="url"
                      value={orgData.website}
                      onChange={(e) =>
                        setOrgData({ ...orgData, website: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={orgData.description}
                      onChange={(e) =>
                        setOrgData({ ...orgData, description: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Banking Tab */}
            {activeTab === 'banking' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Datos bancarios
                  </h2>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  Esta información se usa para realizar las liquidaciones de tus
                  eventos.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banco
                    </label>
                    <select
                      value={bankData.bankName}
                      onChange={(e) =>
                        setBankData({ ...bankData, bankName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    >
                      <option>Bancolombia</option>
                      <option>Davivienda</option>
                      <option>BBVA</option>
                      <option>Banco de Bogotá</option>
                      <option>Banco de Occidente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de cuenta
                    </label>
                    <select
                      value={bankData.accountType}
                      onChange={(e) =>
                        setBankData({ ...bankData, accountType: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    >
                      <option>Ahorros</option>
                      <option>Corriente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de cuenta
                    </label>
                    <input
                      type="text"
                      value={bankData.accountNumber}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Contacta soporte para cambiar tu cuenta bancaria
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titular de la cuenta
                    </label>
                    <input
                      type="text"
                      value={bankData.accountHolder}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                      disabled
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Preferencias de notificación
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Email</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Notificaciones de ventas
                        </span>
                        <input
                          type="checkbox"
                          checked={notifications.emailSales}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              emailSales: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-gray-300 text-[#E53935] focus:ring-[#E53935]"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Resumen de liquidaciones
                        </span>
                        <input
                          type="checkbox"
                          checked={notifications.emailSettlements}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              emailSettlements: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-gray-300 text-[#E53935] focus:ring-[#E53935]"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Notificaciones push
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-600">Cada venta nueva</span>
                        <input
                          type="checkbox"
                          checked={notifications.pushSales}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              pushSales: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-gray-300 text-[#E53935] focus:ring-[#E53935]"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Recordatorios de eventos
                        </span>
                        <input
                          type="checkbox"
                          checked={notifications.pushReminders}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              pushReminders: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-gray-300 text-[#E53935] focus:ring-[#E53935]"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Miembros del equipo
                </h2>

                <p className="text-gray-500 text-center py-12">
                  Próximamente podrás invitar a tu equipo a gestionar eventos
                  contigo.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
