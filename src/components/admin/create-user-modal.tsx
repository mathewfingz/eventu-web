'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateUserModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type UserRole = 'SUPERADMIN' | 'COORDINATOR' | 'PROMOTER' | 'VENUE' | 'CLIENT';
type PromoterType = 'NATURAL' | 'JURIDICA';

export function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'CLIENT' as UserRole,
        // Campos para promotores
        promoterType: 'NATURAL' as PromoterType,
        nit: '',
        businessName: '',
        // Campos para venues
        venueName: '',
        venueSlug: '',
        venueAddress: '',
        venueCity: '',
        venueCapacity: '',
    });

    const isPromoter = formData.role === 'PROMOTER';
    const isVenue = formData.role === 'VENUE';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    role: formData.role,
                    ...(isPromoter && {
                        promoterType: formData.promoterType,
                        nit: formData.nit || null,
                        businessName: formData.businessName || null,
                    }),
                    ...(isVenue && {
                        venue: {
                            name: formData.venueName,
                            slug: formData.venueSlug || formData.venueName.toLowerCase().replace(/\s+/g, '-'),
                            address: formData.venueAddress,
                            city: formData.venueCity,
                            totalCapacity: parseInt(formData.venueCapacity) || 0,
                        }
                    }),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear usuario');
            }

            // Reset form and close modal
            setFormData({
                name: '',
                email: '',
                phone: '',
                role: 'CLIENT',
                promoterType: 'NATURAL',
                nit: '',
                businessName: '',
                venueName: '',
                venueSlug: '',
                venueAddress: '',
                venueCity: '',
                venueCapacity: '',
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Crear nuevo usuario</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre completo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                            placeholder="Juan Pérez"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                            placeholder="juan@ejemplo.com"
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                            placeholder="+57 300 123 4567"
                        />
                    </div>

                    {/* Rol */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rol <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                        >
                            <option value="CLIENT">Cliente</option>
                            <option value="PROMOTER">Promotor</option>
                            <option value="COORDINATOR">Coordinador</option>
                            <option value="VENUE">Venue</option>
                            <option value="SUPERADMIN">Super Admin</option>
                        </select>
                    </div>

                    {/* Campos para promotores */}
                    {isPromoter && (
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700">Información del promotor</p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de persona</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="promoterType"
                                            checked={formData.promoterType === 'NATURAL'}
                                            onChange={() => setFormData({ ...formData, promoterType: 'NATURAL' })}
                                            className="w-4 h-4 text-[#E53935]"
                                        />
                                        <span className="text-sm text-gray-700">Persona Natural</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="promoterType"
                                            checked={formData.promoterType === 'JURIDICA'}
                                            onChange={() => setFormData({ ...formData, promoterType: 'JURIDICA' })}
                                            className="w-4 h-4 text-[#E53935]"
                                        />
                                        <span className="text-sm text-gray-700">Persona Jurídica</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {formData.promoterType === 'JURIDICA' ? 'NIT' : 'Cédula'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.nit}
                                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none"
                                    placeholder={formData.promoterType === 'JURIDICA' ? '900123456-1' : '1234567890'}
                                />
                            </div>
                            {formData.promoterType === 'JURIDICA' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                                    <input
                                        type="text"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none"
                                        placeholder="Eventos Colombia S.A.S."
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Campos para Venues */}
                    {isVenue && (
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700">Información del Venue</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Lugar *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.venueName}
                                        onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none"
                                        placeholder="Movistar Arena"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                                    <input
                                        type="text"
                                        value={formData.venueSlug}
                                        onChange={(e) => setFormData({ ...formData, venueSlug: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none"
                                        placeholder="movistar-arena"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.venueAddress}
                                        onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none"
                                        placeholder="Diagonal 61C # 26-36"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.venueCity}
                                        onChange={(e) => setFormData({ ...formData, venueCity: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none"
                                        placeholder="Bogotá"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad Total *</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.venueCapacity}
                                    onChange={(e) => setFormData({ ...formData, venueCapacity: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none"
                                    placeholder="14000"
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-[#E53935] text-white rounded-lg text-sm font-medium hover:bg-[#B71C1C] disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Creando...' : 'Crear usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
