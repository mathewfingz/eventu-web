'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    DollarSign,
    Ticket,
    Edit2,
    Save,
    X,
    ShoppingCart,
    Tag,
    Map,
    Image,
    BarChart3,
    FileText,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

// Mock event data
const mockEvent = {
    id: '1',
    name: 'Concierto de Reggaeton Night',
    description: 'La mejor noche de reggaeton con los artistas mas destacados del genero. Una experiencia inolvidable con musica, luces y la mejor energia.',
    date: '2026-01-25T20:00:00',
    doorsOpenAt: '2026-01-25T18:00:00',
    endsAt: '2026-01-25T23:59:00',
    venue: {
        id: 'v1',
        name: 'Movistar Arena',
        address: 'Calle 63 # 59A-06',
        city: 'Bogota'
    },
    category: 'CONCERT',
    status: 'PUBLISHED',
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
    priceFrom: 80000,
    priceTo: 350000,
    ageRestriction: 18,
    tags: ['reggaeton', 'concierto', 'musica'],
    ticketsSold: 1234,
    totalCapacity: 1500,
    revenue: 32500000,
    pendingOrders: 45,
    validatedTickets: 234
};

const quickActions = [
    {
        name: 'Ventas',
        href: 'ventas',
        icon: ShoppingCart,
        description: 'Ver ordenes y ventas',
        color: 'bg-blue-100 text-blue-600'
    },
    {
        name: 'Preventas',
        href: 'preventas',
        icon: Tag,
        description: 'Gestionar etapas de venta',
        color: 'bg-purple-100 text-purple-600'
    },
    {
        name: 'Mapa',
        href: 'mapa',
        icon: Map,
        description: 'Editar mapa de asientos',
        color: 'bg-green-100 text-green-600'
    },
    {
        name: 'Imagenes',
        href: 'imagenes',
        icon: Image,
        description: 'Subir fotos del evento',
        color: 'bg-orange-100 text-orange-600'
    },
    {
        name: 'Boletas',
        href: 'boletas',
        icon: Ticket,
        description: 'Tipos de boletas',
        color: 'bg-pink-100 text-pink-600'
    },
    {
        name: 'Estadisticas',
        href: 'estadisticas',
        icon: BarChart3,
        description: 'Metricas de validacion',
        color: 'bg-cyan-100 text-cyan-600'
    }
];

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params?.eventId as string;

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: mockEvent.name,
        description: mockEvent.description,
        date: mockEvent.date.slice(0, 16),
        doorsOpenAt: mockEvent.doorsOpenAt?.slice(0, 16) || '',
        priceFrom: mockEvent.priceFrom,
        priceTo: mockEvent.priceTo,
        ageRestriction: mockEvent.ageRestriction,
        tags: mockEvent.tags.join(', ')
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: Call API to save changes
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: mockEvent.name,
            description: mockEvent.description,
            date: mockEvent.date.slice(0, 16),
            doorsOpenAt: mockEvent.doorsOpenAt?.slice(0, 16) || '',
            priceFrom: mockEvent.priceFrom,
            priceTo: mockEvent.priceTo,
            ageRestriction: mockEvent.ageRestriction,
            tags: mockEvent.tags.join(', ')
        });
        setIsEditing(false);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-full">
            {/* Header with cover image */}
            <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                <img
                    src={mockEvent.coverUrl}
                    alt={mockEvent.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src={mockEvent.imageUrl}
                            alt={mockEvent.name}
                            className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-lg"
                        />
                        <div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                mockEvent.status === 'PUBLISHED'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-yellow-500 text-white'
                            }`}>
                                {mockEvent.status === 'PUBLISHED' ? 'Publicado' : mockEvent.status}
                            </span>
                            {!isEditing && (
                                <h1 className="text-2xl font-bold text-white mt-1">{mockEvent.name}</h1>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                            isEditing
                                ? 'bg-gray-600 text-white hover:bg-gray-700'
                                : 'bg-white text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        {isEditing ? (
                            <>
                                <X className="w-4 h-4" />
                                Cancelar
                            </>
                        ) : (
                            <>
                                <Edit2 className="w-4 h-4" />
                                Editar
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Event Details Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Informacion del Evento
                        </h2>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre del evento
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripcion
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha y hora
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apertura de puertas
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.doorsOpenAt}
                                            onChange={(e) => setFormData({ ...formData, doorsOpenAt: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Precio desde (COP)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.priceFrom}
                                            onChange={(e) => setFormData({ ...formData, priceFrom: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Precio hasta (COP)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.priceTo}
                                            onChange={(e) => setFormData({ ...formData, priceTo: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Edad minima
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.ageRestriction}
                                            onChange={(e) => setFormData({ ...formData, ageRestriction: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Etiquetas (separadas por coma)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Guardar cambios
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-gray-600">{mockEvent.description}</p>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Fecha</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(mockEvent.date).toLocaleDateString('es-CO', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Hora</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(mockEvent.date).toLocaleTimeString('es-CO', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Lugar</p>
                                            <p className="font-medium text-gray-900">{mockEvent.venue.name}</p>
                                            <p className="text-sm text-gray-500">{mockEvent.venue.city}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Precio</p>
                                            <p className="font-medium text-gray-900">
                                                ${mockEvent.priceFrom.toLocaleString()} - ${mockEvent.priceTo?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4">
                                    {mockEvent.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Acciones rapidas
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.href}
                                    href={`/coordinator/eventos/${eventId}/${action.href}`}
                                    className="p-4 border border-gray-100 rounded-xl hover:border-[#E53935]/30 hover:bg-[#E53935]/5 transition-colors group"
                                >
                                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-medium text-gray-900 group-hover:text-[#E53935]">
                                        {action.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">{action.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    {/* Sales Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Resumen de ventas
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-600">Boletas vendidas</span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                    {mockEvent.ticketsSold} / {mockEvent.totalCapacity}
                                </span>
                            </div>

                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#E53935] rounded-full"
                                    style={{ width: `${(mockEvent.ticketsSold / mockEvent.totalCapacity) * 100}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-600">Ingresos totales</span>
                                </div>
                                <span className="font-semibold text-green-600">
                                    ${(mockEvent.revenue / 1000000).toFixed(1)}M
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-600">Validados</span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                    {mockEvent.validatedTickets}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Alertas
                        </h2>

                        <div className="space-y-3">
                            {mockEvent.pendingOrders > 0 && (
                                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">
                                            {mockEvent.pendingOrders} ordenes pendientes
                                        </p>
                                        <p className="text-xs text-yellow-600">
                                            Requieren validacion de seguridad
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">
                                        Evento configurado correctamente
                                    </p>
                                    <p className="text-xs text-green-600">
                                        Todas las secciones estan completas
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reports Link */}
                    <Link
                        href={`/coordinator/eventos/${eventId}/reportes`}
                        className="block bg-gradient-to-r from-[#E53935] to-[#B71C1C] rounded-xl p-6 text-white"
                    >
                        <FileText className="w-8 h-8 mb-3" />
                        <h3 className="font-semibold mb-1">Generar reportes</h3>
                        <p className="text-sm text-white/80">
                            Exporta informes de ventas y asistencia
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
