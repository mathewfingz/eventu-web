'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Ticket,
    Calendar,
    Heart,
    Settings,
    LogOut,
    X,
    Menu,
    User
} from 'lucide-react';

const navigation = [
    {
        name: 'Inicio',
        href: '/dashboard',
        icon: LayoutDashboard
    },
    {
        name: 'Mis Boletas',
        href: '/dashboard/tickets',
        icon: Ticket
    },
    {
        name: 'Próximos Eventos',
        href: '/dashboard/events',
        icon: Calendar
    },
    {
        name: 'Favoritos',
        href: '/dashboard/favorites',
        icon: Heart
    },
    {
        name: 'Configuración',
        href: '/dashboard/settings',
        icon: Settings
    }
];

interface DashboardSidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
        avatar_url?: string | null;
    };
    isOpen?: boolean;
    onClose?: () => void;
}

export function DashboardSidebar({ user, isOpen = true, onClose }: DashboardSidebarProps) {
    const pathname = usePathname();

    const handleLinkClick = () => {
        if (onClose) {
            onClose();
        }
    };

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                <Link href="/dashboard" className="flex items-center gap-2" onClick={handleLinkClick}>
                    <div className="w-8 h-8 bg-[#E53935] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">E</span>
                    </div>
                    <span className="font-bold text-xl text-[#E53935]">Eventu</span>
                </Link>
                {/* Close button for mobile */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#E53935]/10 rounded-full flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={user.name || 'Usuario'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-6 h-6 text-[#E53935]" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.name || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    onClick={handleLinkClick}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                        isActive
                                            ? 'bg-[#E53935]/10 text-[#E53935]'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Explore Events */}
            <div className="p-4 border-t border-gray-100">
                <Link
                    href="/events"
                    onClick={handleLinkClick}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
                >
                    <Calendar className="w-4 h-4" />
                    Explorar eventos
                </Link>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100">
                <form action="/auth/signout" method="post">
                    <button
                        type="submit"
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar sesión</span>
                    </button>
                </form>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col h-screen sticky top-0">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isOpen && onClose && (
                <div className="lg:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col animate-in slide-in-from-left duration-300">
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}

// Mobile menu toggle button component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <Menu className="w-6 h-6" />
        </button>
    );
}
