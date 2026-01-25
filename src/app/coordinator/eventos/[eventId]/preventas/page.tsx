'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Plus,
    Edit2,
    Trash2,
    Tag,
    Calendar,
    Users,
    Percent,
    Copy,
    Download,
    Play,
    Pause,
    Eye,
    EyeOff,
    X,
    Save,
    CreditCard,
    Mail,
    Key,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

// Mock presales data
const mockPresales = [
    {
        id: '1',
        name: 'Early Bird',
        type: 'CODE',
        startDate: '2026-01-10T00:00:00',
        endDate: '2026-01-20T23:59:00',
        priceModifier: -0.15,
        totalAllocation: 500,
        usedAllocation: 320,
        maxPerUser: 4,
        status: 'ENDED',
        codesCount: 50
    },
    {
        id: '2',
        name: 'Preventa Bancolombia',
        type: 'CREDIT_CARD',
        startDate: '2026-01-15T00:00:00',
        endDate: '2026-01-25T23:59:00',
        priceModifier: -0.10,
        totalAllocation: 300,
        usedAllocation: 180,
        maxPerUser: 6,
        status: 'ACTIVE',
        cardBins: ['377813', '453985']
    },
    {
        id: '3',
        name: 'Venta General',
        type: 'GENERAL',
        startDate: '2026-01-20T00:00:00',
        endDate: '2026-01-25T18:00:00',
        priceModifier: 0,
        totalAllocation: null,
        usedAllocation: 734,
        maxPerUser: 8,
        status: 'ACTIVE'
    }
];

const mockCodes = [
    { code: 'EARLY2026', uses: 45, maxUses: 100, isActive: true },
    { code: 'VIP50OFF', uses: 12, maxUses: 20, isActive: true },
    { code: 'FRIENDS10', uses: 30, maxUses: 30, isActive: false },
    { code: 'PROMO123', uses: 8, maxUses: 50, isActive: true }
];

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
    CODE: { icon: Key, label: 'Codigo', color: 'bg-purple-100 text-purple-700' },
    CREDIT_CARD: { icon: CreditCard, label: 'Tarjeta', color: 'bg-blue-100 text-blue-700' },
    EMAIL_DOMAIN: { icon: Mail, label: 'Email', color: 'bg-green-100 text-green-700' },
    GENERAL: { icon: Users, label: 'General', color: 'bg-gray-100 text-gray-700' }
};

const statusConfig: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'Activa', color: 'bg-green-100 text-green-700' },
    PAUSED: { label: 'Pausada', color: 'bg-yellow-100 text-yellow-700' },
    ENDED: { label: 'Finalizada', color: 'bg-gray-100 text-gray-700' }
};

interface CreatePresaleModalProps {
    onClose: () => void;
    onSave: (data: any) => void;
}

function CreatePresaleModal({ onClose, onSave }: CreatePresaleModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'CODE',
        startDate: '',
        endDate: '',
        priceModifier: -10,
        totalAllocation: '',
        maxPerUser: 4
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            priceModifier: formData.priceModifier / 100
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Nueva Preventa
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la preventa
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Early Bird, Preventa VIP"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de acceso
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(typeConfig).map(([type, config]) => {
                                const Icon = config.icon;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type })}
                                        className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${
                                            formData.type === type
                                                ? 'border-[#E53935] bg-[#E53935]/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{config.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha inicio
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha fin
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descuento (%)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={Math.abs(formData.priceModifier)}
                                    onChange={(e) => setFormData({ ...formData, priceModifier: -Math.abs(parseInt(e.target.value)) })}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                />
                                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Limite de boletas
                            </label>
                            <input
                                type="number"
                                value={formData.totalAllocation}
                                onChange={(e) => setFormData({ ...formData, totalAllocation: e.target.value })}
                                placeholder="Sin limite"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maximo por usuario
                        </label>
                        <input
                            type="number"
                            value={formData.maxPerUser}
                            onChange={(e) => setFormData({ ...formData, maxPerUser: parseInt(e.target.value) })}
                            min="1"
                            max="20"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Crear preventa
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface GenerateCodesModalProps {
    presaleId: string;
    onClose: () => void;
}

function GenerateCodesModal({ presaleId, onClose }: GenerateCodesModalProps) {
    const [quantity, setQuantity] = useState(10);
    const [prefix, setPrefix] = useState('');
    const [singleUse, setSingleUse] = useState(true);
    const [generated, setGenerated] = useState<string[]>([]);

    const handleGenerate = () => {
        const codes = [];
        for (let i = 0; i < quantity; i++) {
            const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
            codes.push(prefix ? `${prefix}${randomPart}` : randomPart);
        }
        setGenerated(codes);
    };

    const handleCopyAll = () => {
        navigator.clipboard.writeText(generated.join('\n'));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Generar Codigos
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {generated.length === 0 ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad de codigos
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    min="1"
                                    max="1000"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prefijo (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={prefix}
                                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                                    placeholder="Ej: VIP, EARLY"
                                    maxLength={10}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="singleUse"
                                    checked={singleUse}
                                    onChange={(e) => setSingleUse(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#E53935] focus:ring-[#E53935]"
                                />
                                <label htmlFor="singleUse" className="text-sm text-gray-700">
                                    Uso unico (cada codigo solo puede usarse una vez)
                                </label>
                            </div>

                            <button
                                onClick={handleGenerate}
                                className="w-full px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] flex items-center justify-center gap-2"
                            >
                                <Key className="w-4 h-4" />
                                Generar {quantity} codigos
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    {generated.length} codigos generados
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopyAll}
                                        className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copiar todos
                                    </button>
                                    <button
                                        onClick={() => {
                                            const blob = new Blob([generated.join('\n')], { type: 'text/plain' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'codigos-preventa.txt';
                                            a.click();
                                        }}
                                        className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                                    >
                                        <Download className="w-4 h-4" />
                                        Descargar
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50 font-mono text-sm">
                                {generated.map((code, i) => (
                                    <div key={i} className="py-1 hover:bg-gray-100 px-2 rounded">
                                        {code}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setGenerated([])}
                                className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Generar mas codigos
                            </button>
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function EventPresalesPage() {
    const params = useParams();
    const eventId = params?.eventId as string;

    const [presales, setPresales] = useState(mockPresales);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCodesModal, setShowCodesModal] = useState<string | null>(null);
    const [expandedPresale, setExpandedPresale] = useState<string | null>(null);

    const handleCreatePresale = (data: any) => {
        const newPresale = {
            id: String(presales.length + 1),
            ...data,
            usedAllocation: 0,
            status: 'ACTIVE'
        };
        setPresales([...presales, newPresale]);
    };

    const handleToggleStatus = (presaleId: string) => {
        setPresales(presales.map(p => {
            if (p.id === presaleId) {
                return {
                    ...p,
                    status: p.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
                };
            }
            return p;
        }));
    };

    return (
        <div className="p-6 bg-gray-100 min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Preventas</h1>
                    <p className="text-gray-600">
                        Gestiona las etapas de venta del evento
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nueva preventa
                </button>
            </div>

            {/* Presales List */}
            <div className="space-y-4">
                {presales.map((presale) => {
                    const TypeIcon = typeConfig[presale.type].icon;
                    const progress = presale.totalAllocation
                        ? (presale.usedAllocation / presale.totalAllocation) * 100
                        : 0;

                    return (
                        <div
                            key={presale.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeConfig[presale.type].color}`}>
                                            <TypeIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold text-gray-900">{presale.name}</h3>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig[presale.status].color}`}>
                                                    {statusConfig[presale.status].label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(presale.startDate).toLocaleDateString('es-CO', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })} - {new Date(presale.endDate).toLocaleDateString('es-CO', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Percent className="w-4 h-4" />
                                                    {presale.priceModifier === 0
                                                        ? 'Sin descuento'
                                                        : `${Math.abs(presale.priceModifier * 100)}% dcto`}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    Max {presale.maxPerUser} por usuario
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {presale.type === 'CODE' && (
                                            <button
                                                onClick={() => setShowCodesModal(presale.id)}
                                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                                            >
                                                <Key className="w-4 h-4" />
                                                Codigos
                                            </button>
                                        )}
                                        {presale.status !== 'ENDED' && (
                                            <button
                                                onClick={() => handleToggleStatus(presale.id)}
                                                className={`p-2 rounded-lg ${
                                                    presale.status === 'ACTIVE'
                                                        ? 'text-yellow-600 hover:bg-yellow-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                }`}
                                                title={presale.status === 'ACTIVE' ? 'Pausar' : 'Activar'}
                                            >
                                                {presale.status === 'ACTIVE' ? (
                                                    <Pause className="w-5 h-5" />
                                                ) : (
                                                    <Play className="w-5 h-5" />
                                                )}
                                            </button>
                                        )}
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress */}
                                {presale.totalAllocation && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-600">Uso de cupo</span>
                                            <span className="font-medium text-gray-900">
                                                {presale.usedAllocation} / {presale.totalAllocation}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${
                                                    progress >= 90 ? 'bg-red-500' :
                                                    progress >= 70 ? 'bg-yellow-500' : 'bg-[#E53935]'
                                                }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Codes section for CODE type */}
                            {presale.type === 'CODE' && expandedPresale === presale.id && (
                                <div className="border-t border-gray-100 p-6 bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium text-gray-900">Codigos de acceso</h4>
                                        <button
                                            onClick={() => setShowCodesModal(presale.id)}
                                            className="text-sm text-[#E53935] hover:text-[#B71C1C] font-medium"
                                        >
                                            Generar nuevos
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {mockCodes.slice(0, 4).map((code) => (
                                            <div
                                                key={code.code}
                                                className={`p-3 rounded-lg border ${
                                                    code.isActive ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-mono text-sm font-medium text-gray-900">
                                                        {code.code}
                                                    </span>
                                                    {code.isActive ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {code.uses} / {code.maxUses} usos
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Expand/collapse button for CODE type */}
                            {presale.type === 'CODE' && (
                                <button
                                    onClick={() => setExpandedPresale(expandedPresale === presale.id ? null : presale.id)}
                                    className="w-full py-2 border-t border-gray-100 text-sm text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-1"
                                >
                                    {expandedPresale === presale.id ? (
                                        <>
                                            <EyeOff className="w-4 h-4" />
                                            Ocultar codigos
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            Ver codigos ({presale.codesCount})
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {presales.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Sin preventas configuradas</h3>
                    <p className="text-gray-500 mb-4">Crea tu primera etapa de venta</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva preventa
                    </button>
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreatePresaleModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleCreatePresale}
                />
            )}

            {showCodesModal && (
                <GenerateCodesModal
                    presaleId={showCodesModal}
                    onClose={() => setShowCodesModal(null)}
                />
            )}
        </div>
    );
}
