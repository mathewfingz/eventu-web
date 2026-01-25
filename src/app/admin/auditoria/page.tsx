'use client';

import { useState } from 'react';
import {
    Search,
    Filter,
    Download,
    Shield,
    User,
    Calendar,
    Ticket,
    CreditCard,
    Settings,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLog {
    id: string;
    timestamp: string;
    action: string;
    entityType: 'TICKET' | 'ORDER' | 'USER' | 'EVENT' | 'PAYMENT' | 'SYSTEM';
    entityId: string;
    performedBy: {
        id: string;
        name: string;
        role: string;
    };
    details: string;
    ip: string;
}

const entityIcons = {
    TICKET: Ticket,
    ORDER: CreditCard,
    USER: User,
    EVENT: Calendar,
    PAYMENT: CreditCard,
    SYSTEM: Settings
};

const entityColors = {
    TICKET: 'bg-blue-100 text-blue-600',
    ORDER: 'bg-green-100 text-green-600',
    USER: 'bg-purple-100 text-purple-600',
    EVENT: 'bg-orange-100 text-orange-600',
    PAYMENT: 'bg-emerald-100 text-emerald-600',
    SYSTEM: 'bg-gray-100 text-gray-600'
};

// Mock data
const mockLogs: AuditLog[] = [
    { id: '1', timestamp: '2026-01-25T07:35:00', action: 'ticket.validated', entityType: 'TICKET', entityId: 'tkt_abc123', performedBy: { id: 'u1', name: 'Pedro Sánchez', role: 'Coordinador' }, details: 'Boleta validada en entrada principal - Bad Bunny', ip: '190.25.123.45' },
    { id: '2', timestamp: '2026-01-25T07:32:00', action: 'order.completed', entityType: 'ORDER', entityId: 'ord_xyz789', performedBy: { id: 'u2', name: 'María García', role: 'Cliente' }, details: 'Orden completada - 2 boletas VIP', ip: '181.52.89.12' },
    { id: '3', timestamp: '2026-01-25T07:30:00', action: 'event.approved', entityType: 'EVENT', entityId: 'evt_def456', performedBy: { id: 'u3', name: 'Carlos Rodríguez', role: 'Super Admin' }, details: 'Evento "Concierto Reggaeton" aprobado', ip: '200.21.45.67' },
    { id: '4', timestamp: '2026-01-25T07:28:00', action: 'user.role_changed', entityType: 'USER', entityId: 'usr_ghi012', performedBy: { id: 'u3', name: 'Carlos Rodríguez', role: 'Super Admin' }, details: 'Rol cambiado de CLIENT a PROMOTER', ip: '200.21.45.67' },
    { id: '5', timestamp: '2026-01-25T07:25:00', action: 'payment.processed', entityType: 'PAYMENT', entityId: 'pay_jkl345', performedBy: { id: 'sys', name: 'Sistema', role: 'Sistema' }, details: 'Pago procesado via MercadoPago - $450,000', ip: '10.0.0.1' },
    { id: '6', timestamp: '2026-01-25T07:20:00', action: 'ticket.transferred', entityType: 'TICKET', entityId: 'tkt_mno678', performedBy: { id: 'u4', name: 'Ana Martínez', role: 'Cliente' }, details: 'Boleta transferida a juanlopez@gmail.com', ip: '186.84.123.89' },
    { id: '7', timestamp: '2026-01-25T07:15:00', action: 'system.config_changed', entityType: 'SYSTEM', entityId: 'cfg_001', performedBy: { id: 'u3', name: 'Carlos Rodríguez', role: 'Super Admin' }, details: 'Comisión de plataforma actualizada a 6%', ip: '200.21.45.67' },
];

export default function AuditPage() {
    const [search, setSearch] = useState('');
    const [entityFilter, setEntityFilter] = useState<string>('all');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const filteredLogs = mockLogs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.details.toLowerCase().includes(search.toLowerCase()) ||
            log.performedBy.name.toLowerCase().includes(search.toLowerCase());
        const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
        return matchesSearch && matchesEntity;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Auditoría
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Registro de todas las acciones en la plataforma
                    </p>
                </div>

                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar logs
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por acción, usuario o detalle..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                        />
                    </div>

                    <select
                        value={entityFilter}
                        onChange={(e) => setEntityFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                        <option value="all">Todas las entidades</option>
                        <option value="TICKET">Boletas</option>
                        <option value="ORDER">Órdenes</option>
                        <option value="USER">Usuarios</option>
                        <option value="EVENT">Eventos</option>
                        <option value="PAYMENT">Pagos</option>
                        <option value="SYSTEM">Sistema</option>
                    </select>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {filteredLogs.map((log) => {
                        const Icon = entityIcons[log.entityType];

                        return (
                            <div
                                key={log.id}
                                onClick={() => setSelectedLog(log)}
                                className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4"
                            >
                                <div className={cn(
                                    'w-10 h-10 rounded-lg flex items-center justify-center',
                                    entityColors[log.entityType]
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm font-mono text-gray-900">
                                            {log.action}
                                        </code>
                                        <span className="text-xs text-gray-400">
                                            {log.entityId}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate mt-1">
                                        {log.details}
                                    </p>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm text-gray-900">{log.performedBy.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(log.timestamp).toLocaleTimeString('es-CO', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6 m-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-gray-900">Detalle del log</h3>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Acción</p>
                                    <code className="text-sm font-mono">{selectedLog.action}</code>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Entidad</p>
                                    <p className="text-sm font-medium">{selectedLog.entityType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">ID de entidad</p>
                                    <code className="text-sm font-mono">{selectedLog.entityId}</code>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Fecha/Hora</p>
                                    <p className="text-sm">{new Date(selectedLog.timestamp).toLocaleString('es-CO')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ejecutado por</p>
                                    <p className="text-sm font-medium">{selectedLog.performedBy.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Rol</p>
                                    <p className="text-sm">{selectedLog.performedBy.role}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">IP</p>
                                    <code className="text-sm font-mono">{selectedLog.ip}</code>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500">Detalles</p>
                                <p className="text-sm mt-1">{selectedLog.details}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
