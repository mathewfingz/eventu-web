'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Camera,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'profile' | 'security' | 'notifications' | 'payment';

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+57 300 123 4567',
    documentType: 'CC',
    documentNumber: '1234567890',
    city: 'Bogotá',
  });

  const [notifications, setNotifications] = useState({
    email: {
      purchases: true,
      reminders: true,
      promotions: false,
      newsletter: true,
    },
    push: {
      purchases: true,
      reminders: true,
      promotions: false,
    },
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Perfil', icon: User },
    { id: 'security' as TabType, label: 'Seguridad', icon: Lock },
    { id: 'notifications' as TabType, label: 'Notificaciones', icon: Bell },
    { id: 'payment' as TabType, label: 'Pagos', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Configuración de cuenta</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    activeTab === tab.id
                      ? 'bg-[#E53935]/10 text-[#E53935] border-l-4 border-[#E53935]'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Información personal
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Actualiza tu información de perfil
                  </p>
                </div>

                <div className="p-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      <div className="w-24 h-24 bg-[#E53935] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        JP
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                        <Camera className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={profile.firstName}
                            onChange={(e) =>
                              setProfile({ ...profile, firstName: e.target.value })
                            }
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Apellido
                        </label>
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) =>
                            setProfile({ ...profile, lastName: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) =>
                            setProfile({ ...profile, email: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de documento
                        </label>
                        <select
                          value={profile.documentType}
                          onChange={(e) =>
                            setProfile({ ...profile, documentType: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        >
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="CE">Cédula de Extranjería</option>
                          <option value="PA">Pasaporte</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de documento
                        </label>
                        <input
                          type="text"
                          value={profile.documentNumber}
                          onChange={(e) =>
                            setProfile({ ...profile, documentNumber: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={profile.city}
                          onChange={(e) =>
                            setProfile({ ...profile, city: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        >
                          <option value="Bogotá">Bogotá</option>
                          <option value="Medellín">Medellín</option>
                          <option value="Cali">Cali</option>
                          <option value="Barranquilla">Barranquilla</option>
                          <option value="Cartagena">Cartagena</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
                  >
                    {saved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Guardado
                      </>
                    ) : (
                      'Guardar cambios'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cambiar contraseña
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Asegúrate de usar una contraseña segura
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña actual
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar nueva contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button className="px-6 py-2 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors">
                      Actualizar contraseña
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Verificación en dos pasos
                      </h2>
                      <p className="text-sm text-gray-500">
                        Añade una capa extra de seguridad
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 mb-4">
                      Protege tu cuenta añadiendo verificación en dos pasos. Cada vez que
                      inicies sesión, necesitarás tu contraseña y un código de
                      verificación.
                    </p>
                    <button className="px-4 py-2 border border-[#E53935] text-[#E53935] rounded-lg font-medium hover:bg-[#E53935]/10 transition-colors">
                      Activar verificación
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Preferencias de notificaciones
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Elige cómo quieres recibir notificaciones
                  </p>
                </div>

                <div className="p-6">
                  {/* Email Notifications */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Correo electrónico
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: 'purchases',
                          label: 'Confirmaciones de compra',
                          desc: 'Recibe confirmación cuando compres boletas',
                        },
                        {
                          key: 'reminders',
                          label: 'Recordatorios de eventos',
                          desc: 'Recuerda tus eventos próximos',
                        },
                        {
                          key: 'promotions',
                          label: 'Promociones y ofertas',
                          desc: 'Entérate de descuentos y preventas',
                        },
                        {
                          key: 'newsletter',
                          label: 'Newsletter semanal',
                          desc: 'Resumen de eventos recomendados',
                        },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <button
                            onClick={() =>
                              setNotifications((prev) => ({
                                ...prev,
                                email: {
                                  ...prev.email,
                                  [item.key]:
                                    !prev.email[item.key as keyof typeof prev.email],
                                },
                              }))
                            }
                            className={cn(
                              'relative w-12 h-6 rounded-full transition-colors',
                              notifications.email[item.key as keyof typeof notifications.email]
                                ? 'bg-[#E53935]'
                                : 'bg-gray-300'
                            )}
                          >
                            <span
                              className={cn(
                                'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                                notifications.email[item.key as keyof typeof notifications.email]
                                  ? 'left-7'
                                  : 'left-1'
                              )}
                            />
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notificaciones push
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: 'purchases',
                          label: 'Confirmaciones de compra',
                          desc: 'Notificación inmediata al comprar',
                        },
                        {
                          key: 'reminders',
                          label: 'Recordatorios de eventos',
                          desc: 'Alerta antes del evento',
                        },
                        {
                          key: 'promotions',
                          label: 'Promociones y ofertas',
                          desc: 'Ofertas flash y preventas',
                        },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <button
                            onClick={() =>
                              setNotifications((prev) => ({
                                ...prev,
                                push: {
                                  ...prev.push,
                                  [item.key]:
                                    !prev.push[item.key as keyof typeof prev.push],
                                },
                              }))
                            }
                            className={cn(
                              'relative w-12 h-6 rounded-full transition-colors',
                              notifications.push[item.key as keyof typeof notifications.push]
                                ? 'bg-[#E53935]'
                                : 'bg-gray-300'
                            )}
                          >
                            <span
                              className={cn(
                                'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                                notifications.push[item.key as keyof typeof notifications.push]
                                  ? 'left-7'
                                  : 'left-1'
                              )}
                            />
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
                  >
                    {saved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Guardado
                      </>
                    ) : (
                      'Guardar preferencias'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Métodos de pago guardados
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Administra tus tarjetas y métodos de pago
                    </p>
                  </div>

                  <div className="p-6">
                    {/* Saved Cards */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            VISA
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              •••• •••• •••• 4532
                            </p>
                            <p className="text-sm text-gray-500">Vence 12/26</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Principal
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            MC
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              •••• •••• •••• 8901
                            </p>
                            <p className="text-sm text-gray-500">Vence 08/25</p>
                          </div>
                        </div>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#E53935] hover:text-[#E53935] transition-colors">
                      + Agregar nuevo método de pago
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Tus datos están protegidos
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Utilizamos encriptación de grado bancario para proteger tu
                        información financiera. Nunca almacenamos los números completos
                        de tus tarjetas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
