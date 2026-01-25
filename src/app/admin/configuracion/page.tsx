'use client';

import { useState } from 'react';
import {
    Save,
    Globe,
    Mail,
    Bell,
    Shield,
    Database,
    Server
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConfigPage() {
    const [settings, setSettings] = useState({
        siteName: 'Eventu',
        siteUrl: 'https://eventu.co',
        supportEmail: 'soporte@eventu.co',
        maxTicketsPerOrder: 6,
        lockDurationMinutes: 10,
        enableQueueSystem: true,
        maintenanceMode: false,
        defaultCommission: 6,
    });

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Configuración General
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Ajustes globales de la plataforma
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors',
                        saved
                            ? 'bg-green-600 text-white'
                            : 'bg-[#E53935] text-white hover:bg-[#B71C1C]'
                    )}
                >
                    <Save className="w-4 h-4" />
                    {saved ? 'Guardado!' : 'Guardar cambios'}
                </button>
            </div>

            {/* Settings Sections */}
            <div className="grid grid-cols-2 gap-6">
                {/* General */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">General</h3>
                            <p className="text-sm text-gray-500">Información básica del sitio</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre del sitio
                            </label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL del sitio
                            </label>
                            <input
                                type="text"
                                value={settings.siteUrl}
                                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email de soporte
                            </label>
                            <input
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Ticketing */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Database className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Ticketing</h3>
                            <p className="text-sm text-gray-500">Configuración de ventas</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Máximo de boletas por orden
                            </label>
                            <input
                                type="number"
                                value={settings.maxTicketsPerOrder}
                                onChange={(e) => setSettings({ ...settings, maxTicketsPerOrder: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duración del lock (minutos)
                            </label>
                            <input
                                type="number"
                                value={settings.lockDurationMinutes}
                                onChange={(e) => setSettings({ ...settings, lockDurationMinutes: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Comisión por defecto (%)
                            </label>
                            <input
                                type="number"
                                value={settings.defaultCommission}
                                onChange={(e) => setSettings({ ...settings, defaultCommission: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Server className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Funcionalidades</h3>
                            <p className="text-sm text-gray-500">Activar/desactivar features</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Sistema de cola virtual</p>
                                <p className="text-sm text-gray-500">Queue-it para eventos de alta demanda</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, enableQueueSystem: !settings.enableQueueSystem })}
                                className={cn(
                                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                    settings.enableQueueSystem ? 'bg-[#E53935]' : 'bg-gray-200'
                                )}
                            >
                                <span
                                    className={cn(
                                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                        settings.enableQueueSystem ? 'translate-x-6' : 'translate-x-1'
                                    )}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Modo mantenimiento</p>
                                <p className="text-sm text-gray-500">Desactiva el acceso público al sitio</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                className={cn(
                                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                    settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'
                                )}
                            >
                                <span
                                    className={cn(
                                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                        settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                    )}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Shield className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Seguridad</h3>
                            <p className="text-sm text-gray-500">Configuración de seguridad</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Nota:</strong> Las configuraciones de seguridad avanzadas
                                están disponibles en la sección de API & Webhooks.
                            </p>
                        </div>

                        <button className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-left">
                            Regenerar claves API →
                        </button>
                        <button className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-left">
                            Ver sesiones activas →
                        </button>
                        <button className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-left">
                            Configurar 2FA obligatorio →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
