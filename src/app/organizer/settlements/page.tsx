'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    FileText,
    Download,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Building2,
    Calendar,
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';

interface Settlement {
    id: string;
    eventId: string;
    eventName?: string;
    eventDate?: string;
    status: 'PENDING' | 'PROCESSING' | 'PAID' | 'ON_HOLD' | 'DISPUTED';
    breakdown: {
        grossRevenue: number;
        ticketCount: number;
        platformCommission: number;
        platformCommissionIVA: number;
        paymentProcessing: number;
        sayco: number;
        acinpro: number;
        iva: number;
        withholdingTax: number;
        icaTax: number;
        totalDeductions: number;
        netPayout: number;
        eventType: string;
        taxpayerType: string;
        city: string;
    };
    paymentReference?: string;
    paidAt?: string;
    createdAt: string;
}

interface SettlementsSummary {
    total: number;
    pending: number;
    paid: number;
    totalPaid: number;
    totalPending: number;
}

export default function SettlementsPage() {
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [summary, setSummary] = useState<SettlementsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

    useEffect(() => {
        fetchSettlements();
    }, []);

    const fetchSettlements = async () => {
        try {
            const response = await fetch('/api/settlements');
            const data = await response.json();

            if (data.success) {
                setSettlements(data.data.settlements);
                setSummary(data.data.summary);
            }
        } catch (error) {
            console.error('Failed to fetch settlements:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async (settlementId: string) => {
        window.open(`/api/settlements/${settlementId}?format=html`, '_blank');
    };

    const statusConfig = {
        PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
        PROCESSING: { label: 'Procesando', color: 'bg-blue-100 text-blue-700', icon: Clock },
        PAID: { label: 'Pagado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
        ON_HOLD: { label: 'Retenido', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
        DISPUTED: { label: 'En disputa', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E53935] border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#212121] font-[Poppins,sans-serif]">
                        Liquidaciones
                    </h1>
                    <p className="text-[#757575] mt-1">
                        Revisa y descarga tus liquidaciones de eventos
                    </p>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <SummaryCard
                            label="Total Liquidaciones"
                            value={summary.total.toString()}
                            icon={FileText}
                        />
                        <SummaryCard
                            label="Pagadas"
                            value={summary.paid.toString()}
                            subValue={formatPrice(summary.totalPaid)}
                            icon={CheckCircle}
                            color="green"
                        />
                        <SummaryCard
                            label="Pendientes"
                            value={summary.pending.toString()}
                            subValue={formatPrice(summary.totalPending)}
                            icon={Clock}
                            color="yellow"
                        />
                        <SummaryCard
                            label="Por Recibir"
                            value={formatPrice(summary.totalPending)}
                            icon={DollarSign}
                            color="red"
                        />
                    </div>
                )}

                {/* Settlements List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold">Historial de Liquidaciones</h2>
                    </div>

                    {settlements.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-[#757575]">No tienes liquidaciones aún</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {settlements.map((settlement) => {
                                const status = statusConfig[settlement.status];
                                const StatusIcon = status.icon;

                                return (
                                    <motion.div
                                        key={settlement.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedSettlement(settlement)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-[#212121]">
                                                        {settlement.eventName || 'Evento'}
                                                    </h3>
                                                    <span className={cn(
                                                        'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                                                        status.color
                                                    )}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-[#757575]">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(settlement.createdAt).toLocaleDateString('es-CO')}
                                                    </span>
                                                    <span>{settlement.breakdown.ticketCount} boletas</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xl font-bold text-[#212121]">
                                                    {formatPrice(settlement.breakdown.netPayout)}
                                                </p>
                                                <p className="text-sm text-[#757575]">
                                                    de {formatPrice(settlement.breakdown.grossRevenue)}
                                                </p>
                                            </div>

                                            <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {selectedSettlement && (
                    <SettlementDetailModal
                        settlement={selectedSettlement}
                        onClose={() => setSelectedSettlement(null)}
                        onDownload={() => downloadReport(selectedSettlement.id)}
                    />
                )}
            </div>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    subValue,
    icon: Icon,
    color = 'gray',
}: {
    label: string;
    value: string;
    subValue?: string;
    icon: any;
    color?: 'gray' | 'green' | 'yellow' | 'red';
}) {
    const colors = {
        gray: 'bg-gray-100 text-gray-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        red: 'bg-[#E53935]/10 text-[#E53935]',
    };

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#757575]">{label}</span>
                <div className={cn('p-2 rounded-lg', colors[color])}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {subValue && <p className="text-sm text-[#757575] mt-1">{subValue}</p>}
        </div>
    );
}

function SettlementDetailModal({
    settlement,
    onClose,
    onDownload,
}: {
    settlement: Settlement;
    onClose: () => void;
    onDownload: () => void;
}) {
    const b = settlement.breakdown;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#E53935] to-[#B71C1C] p-6 text-white">
                    <h2 className="text-xl font-bold">Detalle de Liquidación</h2>
                    <p className="text-white/80">{settlement.eventName || 'Evento'}</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-[#757575]">Ingresos Brutos</p>
                            <p className="text-xl font-bold">{formatPrice(b.grossRevenue)}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-700">Pago Neto</p>
                            <p className="text-xl font-bold text-green-700">{formatPrice(b.netPayout)}</p>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div>
                        <h3 className="font-semibold mb-3">Deducciones</h3>
                        <div className="space-y-2">
                            <DeductionRow label="Comisión Eventu (10%)" value={b.platformCommission} />
                            <DeductionRow label="IVA sobre comisión" value={b.platformCommissionIVA} />
                            <DeductionRow label="Procesamiento de pagos" value={b.paymentProcessing} />
                            <DeductionRow label="SAYCO (Derechos de autor)" value={b.sayco} />
                            <DeductionRow label="ACINPRO (Derechos conexos)" value={b.acinpro} />
                            <DeductionRow label="Retención en la fuente" value={b.withholdingTax} />
                            <DeductionRow label="ICA Municipal" value={b.icaTax} />
                            <DeductionRow label="IVA recaudado" value={b.iva} />

                            <div className="pt-2 border-t border-gray-200">
                                <DeductionRow
                                    label="Total Deducciones"
                                    value={b.totalDeductions}
                                    isTotal
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    {settlement.status === 'PAID' && (
                        <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-700 mb-1">Pagado el {new Date(settlement.paidAt!).toLocaleDateString('es-CO')}</p>
                            <p className="text-sm text-green-700">Referencia: {settlement.paymentReference}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onDownload}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            Descargar Reporte
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function DeductionRow({
    label,
    value,
    isTotal,
}: {
    label: string;
    value: number;
    isTotal?: boolean;
}) {
    return (
        <div className={cn(
            'flex items-center justify-between py-2',
            isTotal && 'font-bold text-lg'
        )}>
            <span className={cn(isTotal ? 'text-[#212121]' : 'text-[#757575]')}>{label}</span>
            <span className={cn(isTotal ? 'text-[#E53935]' : 'text-[#212121]')}>
                -{formatPrice(value)}
            </span>
        </div>
    );
}
