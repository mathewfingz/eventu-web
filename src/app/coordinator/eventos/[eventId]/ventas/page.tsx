'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Search,
    Filter,
    Download,
    Eye,
    ShoppingCart,
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    CreditCard,
    Smartphone,
    Building2,
    Banknote,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';

// Mock orders data
const mockOrders = [
    {
        id: 'ORD-001',
        orderNumber: 'EVT-2026-001234',
        customerName: 'Maria Garcia',
        customerEmail: 'maria@email.com',
        ticketType: 'VIP',
        quantity: 2,
        total: 700000,
        paymentMethod: 'CREDIT_CARD',
        status: 'PAID',
        createdAt: '2026-01-20T14:30:00',
        requiresValidation: false
    },
    {
        id: 'ORD-002',
        orderNumber: 'EVT-2026-001235',
        customerName: 'Carlos Rodriguez',
        customerEmail: 'carlos@email.com',
        ticketType: 'General',
        quantity: 4,
        total: 320000,
        paymentMethod: 'NEQUI',
        status: 'PENDING',
        createdAt: '2026-01-21T10:15:00',
        requiresValidation: true
    },
    {
        id: 'ORD-003',
        orderNumber: 'EVT-2026-001236',
        customerName: 'Ana Martinez',
        customerEmail: 'ana@email.com',
        ticketType: 'Platino',
        quantity: 1,
        total: 350000,
        paymentMethod: 'PSE',
        status: 'PAID',
        createdAt: '2026-01-21T16:45:00',
        requiresValidation: false
    },
    {
        id: 'ORD-004',
        orderNumber: 'EVT-2026-001237',
        customerName: 'Juan Perez',
        customerEmail: 'juan@email.com',
        ticketType: 'General',
        quantity: 3,
        total: 240000,
        paymentMethod: 'DAVIPLATA',
        status: 'PENDING',
        createdAt: '2026-01-22T09:00:00',
        requiresValidation: true
    },
    {
        id: 'ORD-005',
        orderNumber: 'EVT-2026-001238',
        customerName: 'Sofia Lopez',
        customerEmail: 'sofia@email.com',
        ticketType: 'VIP',
        quantity: 2,
        total: 700000,
        paymentMethod: 'CREDIT_CARD',
        status: 'CANCELLED',
        createdAt: '2026-01-19T11:20:00',
        requiresValidation: false
    },
    {
        id: 'ORD-006',
        orderNumber: 'EVT-2026-001239',
        customerName: 'Pedro Sanchez',
        customerEmail: 'pedro@email.com',
        ticketType: 'General',
        quantity: 5,
        total: 400000,
        paymentMethod: 'EFECTY',
        status: 'PENDING',
        createdAt: '2026-01-22T15:30:00',
        requiresValidation: true
    }
];

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ElementType }> = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente', icon: Clock },
    PAID: { bg: 'bg-green-100', text: 'text-green-700', label: 'Pagada', icon: CheckCircle },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada', icon: XCircle },
    REFUNDED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Reembolsada', icon: XCircle }
};

const paymentMethodIcons: Record<string, { icon: React.ElementType; label: string }> = {
    CREDIT_CARD: { icon: CreditCard, label: 'Tarjeta' },
    DEBIT_CARD: { icon: CreditCard, label: 'Debito' },
    NEQUI: { icon: Smartphone, label: 'Nequi' },
    DAVIPLATA: { icon: Smartphone, label: 'Daviplata' },
    PSE: { icon: Building2, label: 'PSE' },
    EFECTY: { icon: Banknote, label: 'Efecty' },
    MERCADOPAGO: { icon: CreditCard, label: 'MercadoPago' }
};

interface OrderDetailModalProps {
    order: typeof mockOrders[0];
    onClose: () => void;
}

function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
    const StatusIcon = statusConfig[order.status].icon;
    const PaymentIcon = paymentMethodIcons[order.paymentMethod]?.icon || CreditCard;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Detalle de Orden
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order number and status */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Numero de orden</p>
                            <p className="font-mono font-semibold text-gray-900">{order.orderNumber}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${statusConfig[order.status].bg} ${statusConfig[order.status].text}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig[order.status].label}
                        </span>
                    </div>

                    {/* Security validation alert */}
                    {order.requiresValidation && (
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-800">Requiere validacion de seguridad</p>
                                <p className="text-sm text-yellow-600">
                                    Esta orden necesita revision manual antes de liberar los tickets.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Customer info */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Cliente</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-medium text-gray-900">{order.customerName}</p>
                            <p className="text-sm text-gray-600">{order.customerEmail}</p>
                        </div>
                    </div>

                    {/* Order details */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Detalles</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tipo de boleta</span>
                                <span className="font-medium text-gray-900">{order.ticketType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Cantidad</span>
                                <span className="font-medium text-gray-900">{order.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Metodo de pago</span>
                                <span className="font-medium text-gray-900 flex items-center gap-2">
                                    <PaymentIcon className="w-4 h-4" />
                                    {paymentMethodIcons[order.paymentMethod]?.label || order.paymentMethod}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Fecha</span>
                                <span className="font-medium text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString('es-CO', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between">
                                <span className="font-medium text-gray-900">Total</span>
                                <span className="font-bold text-gray-900 text-lg">
                                    ${order.total.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
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

export default function EventSalesPage() {
    const params = useParams();
    const eventId = params?.eventId as string;

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [validationFilter, setValidationFilter] = useState<boolean | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter orders
    const filteredOrders = mockOrders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesValidation = validationFilter === null || order.requiresValidation === validationFilter;
        return matchesSearch && matchesStatus && matchesValidation;
    });

    // Calculate stats
    const totalOrders = mockOrders.length;
    const totalRevenue = mockOrders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = mockOrders.filter(o => o.status === 'PENDING').length;
    const pendingValidation = mockOrders.filter(o => o.requiresValidation).length;

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-6 bg-gray-100 min-h-full">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
                <p className="text-gray-600">
                    Gestiona las ordenes de compra del evento
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total Ordenes</span>
                        <ShoppingCart className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Ingresos</span>
                        <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        ${(totalRevenue / 1000000).toFixed(1)}M
                    </p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Pendientes</span>
                        <Clock className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Por Validar</span>
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{pendingValidation}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por orden, cliente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] bg-white"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="PAID">Pagada</option>
                        <option value="CANCELLED">Cancelada</option>
                        <option value="REFUNDED">Reembolsada</option>
                    </select>

                    {/* Validation filter */}
                    <button
                        onClick={() => setValidationFilter(validationFilter === true ? null : true)}
                        className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${validationFilter === true
                                ? 'bg-orange-100 border-orange-300 text-orange-700'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Pendientes de validacion
                    </button>

                    {/* Export */}
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Orden</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Cliente</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Boleta</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Pago</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Total</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Estado</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedOrders.map((order) => {
                            const StatusIcon = statusConfig[order.status].icon;
                            const PaymentIcon = paymentMethodIcons[order.paymentMethod]?.icon || CreditCard;

                            return (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-medium text-gray-900">
                                                {order.orderNumber}
                                            </span>
                                            {order.requiresValidation && (
                                                <div title="Requiere validacion" className="inline-flex">
                                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('es-CO', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                                        <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-900">{order.ticketType}</span>
                                        <span className="text-sm text-gray-500"> x{order.quantity}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <PaymentIcon className="w-4 h-4" />
                                            {paymentMethodIcons[order.paymentMethod]?.label || order.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        ${order.total.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${statusConfig[order.status].bg} ${statusConfig[order.status].text}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusConfig[order.status].label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-2 text-gray-500 hover:text-[#E53935] hover:bg-gray-100 rounded-lg"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Empty state */}
                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron ordenes</h3>
                        <p className="text-gray-500">Intenta ajustar los filtros de busqueda</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} de {filteredOrders.length}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
