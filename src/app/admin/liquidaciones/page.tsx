'use client';

import { useState } from 'react';
import {
    Download,
    Check,
    X,
    Eye,
    Clock,
    DollarSign,
    Building,
    Calendar,
    FileText,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Settlement {
    id: string;
    eventId: string;
    eventName: string;
    promoter: {
        id: string;
        name: string;
        bankAccount: string;
    };
    grossRevenue: number;
    totalDeductions: number;
    netAmount: number;
    status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
    eventDate: string;
    createdAt: string;
    breakdown: {
        platformFee: number;
        sayco: number;
        acinpro: number;
        iva: number;
        retencion: number;
    };
}

const statusConfig = {
    PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    APPROVED: { label: 'Aprobada', color: 'bg-blue-100 text-blue-800', icon: Check },
    PAID: { label: 'Pagada', color: 'bg-green-100 text-green-800', icon: DollarSign },
    REJECTED: { label: 'Rechazada', color: 'bg-red-100 text-red-800', icon: X }
};

// Mock data
const mockSettlements: Settlement[] = [
    {
        id: '1',
        eventId: 'ev1',
        eventName: 'Bad Bunny - World Tour',
        promoter: { id: 'p1', name: 'Live Nation Colombia', bankAccount: '****4532' },
        grossRevenue: 1890000000,
        totalDeductions: 378000000,
        netAmount: 1512000000,
        status: 'PENDING',
        eventDate: '2026-03-15',
        createdAt: '2026-03-16',
        breakdown: { platformFee: 113400000, sayco: 189000000, acinpro: 75600000, iva: 0, retencion: 0 }
    },
    {
        id: '2',
        eventId: 'ev2',
        eventName: 'Coldplay - Music of the Spheres',
        promoter: { id: 'p2', name: 'Live Nation', bankAccount: '****7891' },
        grossRevenue: 1520000000,
        totalDeductions: 304000000,
        netAmount: 1216000000,
        status: 'APPROVED',
        eventDate: '2026-05-10',
        createdAt: '2026-05-11',
        breakdown: { platformFee: 91200000, sayco: 152000000, acinpro: 60800000, iva: 0, retencion: 0 }
    },
    {
        id: '3',
        eventId: 'ev3',
        eventName: 'Festival Vallenato',
        promoter: { id: 'p3', name: 'EventosCO', bankAccount: '****2234' },
        grossRevenue: 280000000,
        totalDeductions: 56000000,
        netAmount: 224000000,
        status: 'PAID',
        eventDate: '2026-01-10',
        createdAt: '2026-01-11',
        breakdown: { platformFee: 16800000, sayco: 28000000, acinpro: 11200000, iva: 0, retencion: 0 }
    },
];

export default function SettlementsPage() {
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');

    const filteredSettlements = mockSettlements.filter(s => {
        if (filter === 'all') return true;
        if (filter === 'pending') return s.status === 'PENDING';
        if (filter === 'approved') return s.status === 'APPROVED';
        if (filter === 'paid') return s.status === 'PAID';
        return true;
    });

    const summary = {
        pending: mockSettlements.filter(s => s.status === 'PENDING').length,
        approved: mockSettlements.filter(s => s.status === 'APPROVED').length,
        totalPending: mockSettlements.filter(s => s.status === 'PENDING').reduce((sum, s) => sum + s.netAmount, 0),
        paidThisMonth: mockSettlements.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.netAmount, 0)
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Liquidaciones
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Gestiona los pagos a promotores
                    </p>
                </div>

                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pendientes</p>
                            <p className="text-xl font-bold">{summary.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Check className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Aprobadas</p>
                            <p className="text-xl font-bold">{summary.approved}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Por pagar</p>
                            <p className="text-xl font-bold">
                                {formatCurrency(summary.totalPending)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Este mes</p>
                            <p className="text-xl font-bold">
                                {formatCurrency(summary.paidThisMonth)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                {(['all', 'pending', 'approved', 'paid'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                            filter === f
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        )}
                    >
                        {f === 'all' ? 'Todas' :
                            f === 'pending' ? 'Pendientes' :
                                f === 'approved' ? 'Aprobadas' : 'Pagadas'}
                    </button>
                ))}
            </div>

            {/* Settlements List */}
            <div className="space-y-4">
                {filteredSettlements.map((settlement) => {
                    const StatusIcon = statusConfig[settlement.status].icon;

                    return (
                        <div
                            key={settlement.id}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                        <Building className="w-6 h-6 text-gray-600" />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {settlement.eventName}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {settlement.promoter.name}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(settlement.eventDate).toLocaleDateString('es-CO')}
                                            </span>
                                            <span>
                                                Cuenta: {settlement.promoter.bankAccount}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <span className={cn(
                                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                                    statusConfig[settlement.status].color
                                )}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {statusConfig[settlement.status].label}
                                </span>
                            </div>

                            {/* Financial breakdown */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="grid grid-cols-5 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Ingresos brutos</p>
                                        <p className="font-semibold text-gray-900">
                                            {formatCurrency(settlement.grossRevenue)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Comisión Eventu</p>
                                        <p className="font-semibold text-red-600">
                                            -{formatCurrency(settlement.breakdown.platformFee)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">SAYCO + ACINPRO</p>
                                        <p className="font-semibold text-red-600">
                                            -{formatCurrency(settlement.breakdown.sayco + settlement.breakdown.acinpro)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Impuestos</p>
                                        <p className="font-semibold text-red-600">
                                            -{formatCurrency(settlement.breakdown.iva + settlement.breakdown.retencion)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Neto a pagar</p>
                                        <p className="text-xl font-bold text-green-600">
                                            {formatCurrency(settlement.netAmount)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {settlement.status === 'PENDING' && (
                                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        Ver detalle
                                    </button>
                                    <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center gap-2">
                                        <X className="w-4 h-4" />
                                        Rechazar
                                    </button>
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        Aprobar y pagar
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
