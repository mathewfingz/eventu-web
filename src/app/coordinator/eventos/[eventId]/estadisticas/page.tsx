'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
    CheckCircle,
    XCircle,
    Clock,
    Users,
    Activity,
    TrendingUp,
    AlertTriangle,
    RefreshCw,
    Smartphone,
    BarChart3
} from 'lucide-react';

// Mock stats data
const mockStats = {
    validated: 1234,
    rejected: 45,
    pending: 266,
    successRate: 96.5,
    peakHour: '20:00',
    avgValidationsPerMinute: 12.3
};

const mockHourlyData = [
    { hour: '18:00', validated: 45, rejected: 2 },
    { hour: '19:00', validated: 156, rejected: 8 },
    { hour: '20:00', validated: 423, rejected: 15 },
    { hour: '21:00', validated: 312, rejected: 12 },
    { hour: '22:00', validated: 198, rejected: 6 },
    { hour: '23:00', validated: 100, rejected: 2 }
];

const mockDevices = [
    { id: 'd1', name: 'Scanner Puerta A', validated: 456, lastActive: '2 min' },
    { id: 'd2', name: 'Scanner Puerta B', validated: 389, lastActive: '1 min' },
    { id: 'd3', name: 'Scanner VIP', validated: 234, lastActive: '5 min' },
    { id: 'd4', name: 'Scanner Puerta C', validated: 155, lastActive: '30 seg' }
];

const mockCapacityAlerts = [
    { section: 'VIP', current: 142, total: 150, percentage: 94.7, status: 'warning' },
    { section: 'General', current: 420, total: 500, percentage: 84, status: 'normal' },
    { section: 'Platino', current: 100, total: 100, percentage: 100, status: 'full' }
];

export default function EventStatsPage() {
    const params = useParams();
    const eventId = params?.eventId as string;
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsRefreshing(false);
    };

    const maxValidations = Math.max(...mockHourlyData.map(d => d.validated));

    return (
        <div className="p-6 bg-gray-100 min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Estadisticas en Vivo</h1>
                    <p className="text-gray-600">
                        Monitorea las validaciones del evento en tiempo real
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Validados</span>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{mockStats.validated.toLocaleString()}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4" />
                        +{mockStats.avgValidationsPerMinute.toFixed(1)}/min
                    </p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Rechazados</span>
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{mockStats.rejected}</p>
                    <p className="text-sm text-gray-500 mt-1">intentos fallidos</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Pendientes</span>
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-yellow-600">{mockStats.pending}</p>
                    <p className="text-sm text-gray-500 mt-1">por ingresar</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Tasa de Exito</span>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{mockStats.successRate}%</p>
                    <p className="text-sm text-gray-500 mt-1">validaciones correctas</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hourly Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-semibold text-gray-900">Validaciones por Hora</h2>
                        <span className="text-sm text-gray-500">
                            Pico: {mockStats.peakHour}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {mockHourlyData.map((data) => (
                            <div key={data.hour} className="flex items-center gap-4">
                                <span className="w-12 text-sm text-gray-600 font-mono">
                                    {data.hour}
                                </span>
                                <div className="flex-1 flex items-center gap-2">
                                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{ width: `${(data.validated / maxValidations) * 100}%` }}
                                        />
                                        <div
                                            className="h-full bg-red-500"
                                            style={{ width: `${(data.rejected / maxValidations) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="w-16 text-sm text-gray-900 text-right font-medium">
                                    {data.validated}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-sm text-gray-600">Validados</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-sm text-gray-600">Rechazados</span>
                        </div>
                    </div>
                </div>

                {/* Capacity Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <h2 className="font-semibold text-gray-900">Alertas de Capacidad</h2>
                    </div>

                    <div className="space-y-4">
                        {mockCapacityAlerts.map((alert) => (
                            <div key={alert.section}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-900">
                                        {alert.section}
                                    </span>
                                    <span className={`text-sm font-medium ${
                                        alert.status === 'full' ? 'text-red-600' :
                                        alert.status === 'warning' ? 'text-yellow-600' : 'text-gray-600'
                                    }`}>
                                        {alert.percentage.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${
                                            alert.status === 'full' ? 'bg-red-500' :
                                            alert.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                        style={{ width: `${alert.percentage}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-500">
                                        {alert.current} dentro
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {alert.total - alert.current} restantes
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {mockCapacityAlerts.some(a => a.status === 'full') && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-700">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">Seccion llena</span>
                            </div>
                            <p className="text-xs text-red-600 mt-1">
                                La seccion Platino ha alcanzado su capacidad maxima
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Active Devices */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-gray-500" />
                        <h2 className="font-semibold text-gray-900">Dispositivos Activos</h2>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        {mockDevices.length} conectados
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockDevices.map((device) => (
                        <div
                            key={device.id}
                            className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-gray-900">{device.name}</span>
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    Activo
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{device.validated}</p>
                                    <p className="text-xs text-gray-500">validaciones</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Hace {device.lastActive}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Real-time indicator */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Datos en tiempo real - Ultima actualizacion hace 5 segundos
            </div>
        </div>
    );
}
