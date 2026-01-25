'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Plus,
    Edit2,
    Trash2,
    Ticket,
    DollarSign,
    Users,
    Calendar,
    Save,
    X,
    AlertCircle,
    Loader2,
    ArrowUp,
    ArrowDown,
    MoreVertical
} from 'lucide-react';

interface TicketType {
    id: string;
    name: string;
    description: string;
    price: number;
    totalQuantity: number;
    soldQuantity: number;
    maxPerOrder: number;
    minPerOrder: number;
    saleStartsAt: string | null;
    saleEndsAt: string | null;
    sectionId: string | null;
    isActive: boolean;
}

// Mock data
const mockTicketTypes: TicketType[] = [
    {
        id: '1',
        name: 'VIP',
        description: 'Acceso preferencial con vista privilegiada al escenario',
        price: 350000,
        totalQuantity: 150,
        soldQuantity: 120,
        maxPerOrder: 4,
        minPerOrder: 1,
        saleStartsAt: '2026-01-10T00:00:00',
        saleEndsAt: '2026-01-25T18:00:00',
        sectionId: 'sec-1',
        isActive: true
    },
    {
        id: '2',
        name: 'General',
        description: 'Entrada general al evento',
        price: 80000,
        totalQuantity: 500,
        soldQuantity: 380,
        maxPerOrder: 8,
        minPerOrder: 1,
        saleStartsAt: null,
        saleEndsAt: null,
        sectionId: 'sec-2',
        isActive: true
    },
    {
        id: '3',
        name: 'Platino',
        description: 'Zona exclusiva con servicio de bebidas incluido',
        price: 250000,
        totalQuantity: 100,
        soldQuantity: 85,
        maxPerOrder: 6,
        minPerOrder: 1,
        saleStartsAt: null,
        saleEndsAt: null,
        sectionId: 'sec-3',
        isActive: true
    }
];

interface TicketTypeModalProps {
    ticketType?: TicketType;
    onClose: () => void;
    onSave: (data: Partial<TicketType>) => void;
}

function TicketTypeModal({ ticketType, onClose, onSave }: TicketTypeModalProps) {
    const [formData, setFormData] = useState({
        name: ticketType?.name || '',
        description: ticketType?.description || '',
        price: ticketType?.price || 0,
        totalQuantity: ticketType?.totalQuantity || 100,
        maxPerOrder: ticketType?.maxPerOrder || 6,
        minPerOrder: ticketType?.minPerOrder || 1,
        saleStartsAt: ticketType?.saleStartsAt?.slice(0, 16) || '',
        saleEndsAt: ticketType?.saleEndsAt?.slice(0, 16) || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSave(formData);
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {ticketType ? 'Editar Tipo de Boleta' : 'Nuevo Tipo de Boleta'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: VIP, General, Platino"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripcion
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe los beneficios de este tipo de boleta"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Precio (COP)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cantidad total
                            </label>
                            <input
                                type="number"
                                value={formData.totalQuantity}
                                onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Minimo por orden
                            </label>
                            <input
                                type="number"
                                value={formData.minPerOrder}
                                onChange={(e) => setFormData({ ...formData, minPerOrder: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maximo por orden
                            </label>
                            <input
                                type="number"
                                value={formData.maxPerOrder}
                                onChange={(e) => setFormData({ ...formData, maxPerOrder: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Inicio de venta (opcional)
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.saleStartsAt}
                                onChange={(e) => setFormData({ ...formData, saleStartsAt: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fin de venta (opcional)
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.saleEndsAt}
                                onChange={(e) => setFormData({ ...formData, saleEndsAt: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                            />
                        </div>
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
                            disabled={isSaving}
                            className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {ticketType ? 'Guardar cambios' : 'Crear boleta'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function EventTicketTypesPage() {
    const params = useParams();
    const eventId = params?.eventId as string;

    const [ticketTypes, setTicketTypes] = useState<TicketType[]>(mockTicketTypes);
    const [showModal, setShowModal] = useState(false);
    const [editingTicket, setEditingTicket] = useState<TicketType | undefined>(undefined);

    const totalCapacity = ticketTypes.reduce((sum, t) => sum + t.totalQuantity, 0);
    const totalSold = ticketTypes.reduce((sum, t) => sum + t.soldQuantity, 0);
    const totalRevenue = ticketTypes.reduce((sum, t) => sum + (t.soldQuantity * t.price), 0);

    const handleCreate = () => {
        setEditingTicket(undefined);
        setShowModal(true);
    };

    const handleEdit = (ticket: TicketType) => {
        setEditingTicket(ticket);
        setShowModal(true);
    };

    const handleSave = (data: Partial<TicketType>) => {
        if (editingTicket) {
            setTicketTypes(ticketTypes.map(t =>
                t.id === editingTicket.id ? { ...t, ...data } : t
            ));
        } else {
            const newTicket: TicketType = {
                id: String(Date.now()),
                name: data.name || '',
                description: data.description || '',
                price: data.price || 0,
                totalQuantity: data.totalQuantity || 100,
                soldQuantity: 0,
                maxPerOrder: data.maxPerOrder || 6,
                minPerOrder: data.minPerOrder || 1,
                saleStartsAt: data.saleStartsAt || null,
                saleEndsAt: data.saleEndsAt || null,
                sectionId: null,
                isActive: true
            };
            setTicketTypes([...ticketTypes, newTicket]);
        }
    };

    const handleDelete = (id: string) => {
        const ticket = ticketTypes.find(t => t.id === id);
        if (ticket && ticket.soldQuantity > 0) {
            alert('No puedes eliminar un tipo de boleta con ventas');
            return;
        }
        setTicketTypes(ticketTypes.filter(t => t.id !== id));
    };

    return (
        <div className="p-6 bg-gray-100 min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tipos de Boletas</h1>
                    <p className="text-gray-600">
                        Configura los tipos de entrada disponibles
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nueva boleta
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Capacidad Total</span>
                        <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{totalCapacity.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{ticketTypes.length} tipos de boleta</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Vendidas</span>
                        <Ticket className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{totalSold.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(totalSold / totalCapacity) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500">
                            {((totalSold / totalCapacity) * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Ingresos Proyectados</span>
                        <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        ${(totalRevenue / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-gray-500">COP en ventas</p>
                </div>
            </div>

            {/* Ticket Types List */}
            <div className="space-y-4">
                {ticketTypes.map((ticket) => {
                    const soldPercent = (ticket.soldQuantity / ticket.totalQuantity) * 100;
                    const availableCount = ticket.totalQuantity - ticket.soldQuantity;

                    return (
                        <div
                            key={ticket.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-[#E53935]/10 rounded-xl flex items-center justify-center">
                                            <Ticket className="w-6 h-6 text-[#E53935]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                                                {availableCount === 0 && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                                        Agotado
                                                    </span>
                                                )}
                                                {availableCount > 0 && availableCount < 20 && (
                                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                                        Ultimas {availableCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4" />
                                                    ${ticket.price.toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {ticket.minPerOrder}-{ticket.maxPerOrder} por orden
                                                </span>
                                                {ticket.saleStartsAt && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(ticket.saleStartsAt).toLocaleDateString('es-CO', {
                                                            day: 'numeric',
                                                            month: 'short'
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(ticket)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ticket.id)}
                                            disabled={ticket.soldQuantity > 0}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={ticket.soldQuantity > 0 ? 'No se puede eliminar con ventas' : 'Eliminar'}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-gray-600">Inventario</span>
                                        <span className="font-medium text-gray-900">
                                            {ticket.soldQuantity} / {ticket.totalQuantity} vendidas
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${
                                                soldPercent >= 90 ? 'bg-red-500' :
                                                soldPercent >= 70 ? 'bg-yellow-500' : 'bg-[#E53935]'
                                            }`}
                                            style={{ width: `${soldPercent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-xs text-gray-500">
                                            {availableCount} disponibles
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            ${(ticket.soldQuantity * ticket.price / 1000000).toFixed(1)}M vendido
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {ticketTypes.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Sin tipos de boleta</h3>
                    <p className="text-gray-500 mb-4">Crea el primer tipo de entrada para tu evento</p>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva boleta
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <TicketTypeModal
                    ticketType={editingTicket}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
