'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Calendar,
    DollarSign,
    FileText,
    BarChart3,
    Clock,
    Bell,
    Shield,
    Settings,
    LogOut,
    ChevronDown,
    ShoppingCart,
    Map
} from 'lucide-react';

const navigation = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard
    },
    {
        name: 'Usuarios',
        href: '/admin/usuarios',
        icon: Users,
        badge: 'new'
    },
    {
        name: 'Eventos',
        href: '/admin/eventos',
        icon: Calendar,
        children: [
            { name: 'Todos los eventos', href: '/admin/eventos' },
            { name: 'Pendientes de aprobación', href: '/admin/eventos/pendientes' },
            { name: 'Destacados', href: '/admin/eventos/destacados' }
        ]
    },
    {
        name: 'Mapas',
        href: '/admin/mapas',
        icon: Map
    },
    {
        name: 'Finanzas',
        href: '/admin/finanzas',
        icon: DollarSign,
        children: [
            { name: 'Overview', href: '/admin/finanzas' },
            { name: 'Comisiones', href: '/admin/finanzas/comisiones' },
            { name: 'Impuestos', href: '/admin/finanzas/impuestos' },
            { name: 'Transacciones', href: '/admin/finanzas/transacciones' }
        ]
    },
    {
        name: 'Órdenes',
        href: '/admin/ordenes',
        icon: ShoppingCart
    },
    {
        name: 'Liquidaciones',
        href: '/admin/liquidaciones',
        icon: FileText,
        badge: 5
    },
    {
        name: 'Reportes',
        href: '/admin/reportes',
        icon: BarChart3
    },
    {
        name: 'Cola Virtual',
        href: '/admin/cola-virtual',
        icon: Clock
    },
    {
        name: 'Comunicaciones',
        href: '/admin/comunicaciones',
        icon: Bell
    },
    {
        name: 'Auditoría',
        href: '/admin/auditoria',
        icon: Shield
    },
    {
        name: 'Configuración',
        href: '/admin/configuracion',
        icon: Settings,
        children: [
            { name: 'General', href: '/admin/configuracion' },
            { name: 'Métodos de pago', href: '/admin/configuracion/pagos' },
            { name: 'Emails', href: '/admin/configuracion/emails' },
            { name: 'API & Webhooks', href: '/admin/configuracion/integraciones' }
        ]
    }
];

interface AdminSidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleExpand = (name: string) => {
        setExpandedItems(prev =>
            prev.includes(name)
                ? prev.filter(item => item !== name)
                : [...prev, name]
        );
    };

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-800">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#E53935] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">E</span>
                    </div>
                    <span className="font-bold text-xl">Eventu</span>
                </Link>
                <span className="ml-2 px-2 py-0.5 bg-[#E53935]/20 text-[#E53935] text-xs rounded-full">
                    Admin
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        const isExpanded = expandedItems.includes(item.name);
                        const Icon = item.icon;

                        return (
                            <li key={item.name}>
                                {item.children ? (
                                    <>
                                        <button
                                            onClick={() => toggleExpand(item.name)}
                                            className={cn(
                                                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors',
                                                isActive
                                                    ? 'bg-gray-800 text-white'
                                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            <ChevronDown
                                                className={cn(
                                                    'w-4 h-4 transition-transform',
                                                    isExpanded && 'rotate-180'
                                                )}
                                            />
                                        </button>

                                        {isExpanded && (
                                            <ul className="mt-1 ml-8 space-y-1">
                                                {item.children.map((child) => (
                                                    <li key={child.href}>
                                                        <Link
                                                            href={child.href}
                                                            className={cn(
                                                                'block px-3 py-2 rounded-lg text-sm transition-colors',
                                                                pathname === child.href
                                                                    ? 'bg-[#E53935] text-white'
                                                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                            )}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                            isActive
                                                ? 'bg-gray-800 text-white'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.name}</span>
                                        {item.badge && (
                                            <span className="ml-auto px-2 py-0.5 bg-[#E53935] text-white text-xs rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                            {user.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name || 'Admin'}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
