'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Calendar,
    Plus,
    DollarSign,
    BarChart3,
    Settings,
    LogOut,
    X,
    Menu,
    Building2
} from 'lucide-react';

const navigation = [
    {
        name: 'Dashboard',
        href: '/organizer',
        icon: LayoutDashboard
    },
    {
        name: 'Mis Eventos',
        href: '/organizer/events',
        icon: Calendar
    },
    {
        name: 'Crear Evento',
        href: '/organizer/events/new',
        icon: Plus,
        highlight: true
    },
    {
        name: 'Liquidaciones',
        href: '/organizer/settlements',
        icon: DollarSign
    },
    {
        name: 'Analytics',
        href: '/organizer/analytics',
        icon: BarChart3
    },
    {
        name: 'Configuración',
        href: '/organizer/settings',
        icon: Settings
    }
];

interface OrganizerSidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
    isOpen?: boolean;
    onClose?: () => void;
}

export function OrganizerSidebar({ user, isOpen = true, onClose }: OrganizerSidebarProps) {
    const pathname = usePathname();

    const handleLinkClick = () => {
        if (onClose) {
            onClose();
        }
    };

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
                <Link href="/organizer" className="flex items-center gap-2" onClick={handleLinkClick}>
                    <div className="w-8 h-8 bg-[#E53935] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">E</span>
                    </div>
                    <span className="font-bold text-xl text-white">Eventu</span>
                </Link>
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    Organizador
                </span>
                {/* Close button for mobile */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 ml-2"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/organizer' && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    onClick={handleLinkClick}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                        item.highlight && !isActive
                                            ? 'bg-[#E53935] text-white hover:bg-[#B71C1C]'
                                            : isActive
                                            ? 'bg-gray-800 text-white'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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

            {/* User section */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name || 'Organizador'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                        href="/"
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                        title="Volver al inicio"
                    >
                        <LogOut className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-gray-900 text-white flex-col h-screen sticky top-0">
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
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gray-900 text-white flex flex-col animate-in slide-in-from-left duration-300">
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
