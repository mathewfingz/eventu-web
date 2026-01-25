'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Ban,
    CheckCircle,
    Download,
    Loader2,
    RefreshCw,
    Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateUserModal } from '@/components/admin/create-user-modal';
import { ClientDetailModal } from '@/components/admin/client-detail-modal';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: 'SUPERADMIN' | 'COORDINATOR' | 'PROMOTER' | 'VENUE' | 'CLIENT';
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    emailVerified: string | null;
    createdAt: string;
    lastLoginAt: string | null;
    eventsCount?: number;
    promoterType?: string;
    nit?: string;
    businessName?: string;
}

const roleColors: Record<User['role'], string> = {
    SUPERADMIN: 'bg-red-100 text-red-800',
    COORDINATOR: 'bg-purple-100 text-purple-800',
    PROMOTER: 'bg-blue-100 text-blue-800',
    VENUE: 'bg-green-100 text-green-800',
    CLIENT: 'bg-gray-100 text-gray-800'
};

const roleLabels: Record<User['role'], string> = {
    SUPERADMIN: 'Super Admin',
    COORDINATOR: 'Coordinador',
    PROMOTER: 'Promotor',
    VENUE: 'Venue',
    CLIENT: 'Cliente'
};

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800'
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [showDropdown, setShowDropdown] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch users from API
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (roleFilter !== 'all') params.set('role', roleFilter);
            params.set('page', meta.page.toString());

            const response = await fetch(`/api/admin/users?${params}`);
            const data = await response.json();

            if (response.ok) {
                setUsers(data.users || []);
                setMeta(data.meta || { total: 0, page: 1, totalPages: 1 });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter, meta.page]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [fetchUsers]);

    // Toggle user status
    const toggleUserStatus = async (userId: string, currentStatus: string) => {
        setActionLoading(userId);
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setActionLoading(null);
            setShowDropdown(null);
        }
    };

    // Delete user
    const deleteUser = async (userId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

        setActionLoading(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchUsers();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al eliminar usuario');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setActionLoading(null);
            setShowDropdown(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Usuarios
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Gestiona todos los usuarios de la plataforma
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchUsers}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Actualizar
                    </button>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-[#E53935] text-white rounded-lg text-sm font-medium hover:bg-[#B71C1C] flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Crear usuario
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                    >
                        <option value="all">Todos los roles</option>
                        <option value="SUPERADMIN">Super Admin</option>
                        <option value="COORDINATOR">Coordinador</option>
                        <option value="PROMOTER">Promotor</option>
                        <option value="VENUE">Venue</option>
                        <option value="CLIENT">Cliente</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#E53935] animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No se encontraron usuarios</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 text-[#E53935] font-medium hover:underline"
                        >
                            Crear el primer usuario
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Eventos
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Último acceso
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-gray-600">
                                                    {user.name?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name || 'Sin nombre'}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', roleColors[user.role])}>
                                            {roleLabels[user.role]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', statusColors[user.status])}>
                                            {user.status === 'ACTIVE' ? 'Activo' :
                                                user.status === 'INACTIVE' ? 'Inactivo' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {user.eventsCount ?? 0}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {user.lastLoginAt
                                            ? new Date(user.lastLoginAt).toLocaleDateString('es-CO')
                                            : 'Nunca'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
                                                className="p-2 hover:bg-gray-100 rounded-lg"
                                                disabled={actionLoading === user.id}
                                            >
                                                {actionLoading === user.id ? (
                                                    <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                                                ) : (
                                                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                                )}
                                            </button>

                                            {showDropdown === user.id && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUserId(user.id);
                                                            setShowDetailModal(true);
                                                            setShowDropdown(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Ver detalle
                                                    </button>
                                                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                        <Edit className="w-4 h-4" />
                                                        Editar
                                                    </button>
                                                    {user.status === 'ACTIVE' ? (
                                                        <button
                                                            onClick={() => toggleUserStatus(user.id, user.status)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                            Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => toggleUserStatus(user.id, user.status)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Activar
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteUser(user.id)}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {users.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Mostrando {users.length} de {meta.total} usuarios
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setMeta({ ...meta, page: meta.page - 1 })}
                                disabled={meta.page <= 1}
                                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <span className="text-sm text-gray-600">
                                Página {meta.page} de {meta.totalPages}
                            </span>
                            <button
                                onClick={() => setMeta({ ...meta, page: meta.page + 1 })}
                                disabled={meta.page >= meta.totalPages}
                                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            <CreateUserModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchUsers}
            />

            {/* Client Detail Modal */}
            <ClientDetailModal
                open={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedUserId(null);
                }}
                userId={selectedUserId}
            />
        </div>
    );
}
