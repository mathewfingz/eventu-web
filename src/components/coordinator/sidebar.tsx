'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Calendar,
    QrCode,
    Eye,
    ShoppingCart,
    Tag,
    Map,
    Image,
    Ticket,
    BarChart3,
    FileText,
    LogOut,
    ChevronDown,
    ChevronLeft,
    Settings,
    Zap,
    X,
    Menu
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    permission?: string;
    badge?: string;
}

const mainNavigation: NavItem[] = [
    {
        name: 'Dashboard',
        href: '/coordinator',
        icon: LayoutDashboard
    },
    {
        name: 'Eventos',
        href: '/coordinator/eventos',
        icon: Calendar
    },
    {
        name: 'Scanner',
        href: '/coordinator/scanner',
        icon: QrCode,
        badge: 'QR'
    }
];

const eventNavigation: NavItem[] = [
    {
        name: 'Resumen',
        href: '',
        icon: Eye,
        permission: 'canEditEvent'
    },
    {
        name: 'Ventas',
        href: '/ventas',
        icon: ShoppingCart,
        permission: 'canViewOrders'
    },
    {
        name: 'Preventas',
        href: '/preventas',
        icon: Tag,
        permission: 'canEditPresales'
    },
    {
        name: 'Mapa',
        href: '/mapa',
        icon: Map,
        permission: 'canEditMap'
    },
    {
        name: 'Imagenes',
        href: '/imagenes',
        icon: Image,
        permission: 'canUploadImages'
    },
    {
        name: 'Boletas',
        href: '/boletas',
        icon: Ticket,
        permission: 'canEditTicketTypes'
    },
    {
        name: 'Stats',
        href: '/estadisticas',
        icon: BarChart3,
        permission: 'canViewReports'
    },
    {
        name: 'Reportes',
        href: '/reportes',
        icon: FileText,
        permission: 'canViewReports'
    }
];

interface CoordinatorSidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
    currentEvent?: {
        id: string;
        name: string;
    } | null;
    permissions?: {
        canViewOrders: boolean;
        canEditPresales: boolean;
        canEditMap: boolean;
        canUploadImages: boolean;
        canEditTicketTypes: boolean;
        canEditEvent: boolean;
        canViewReports: boolean;
        canScan: boolean;
    };
    isOpen?: boolean;
    onClose?: () => void;
}

export function CoordinatorSidebar({ user, currentEvent, permissions, isOpen = true, onClose }: CoordinatorSidebarProps) {
    const pathname = usePathname();
    const params = useParams();
    const eventId = params?.eventId as string;
    const [isEventMenuExpanded, setIsEventMenuExpanded] = useState(!!eventId);

    const hasPermission = (permission?: string) => {
        if (!permission || !permissions) return true;
        return permissions[permission as keyof typeof permissions] ?? false;
    };

    const handleLinkClick = () => {
        if (onClose) {
            onClose();
        }
    };

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="h-14 flex items-center px-4 border-b border-white/5">
                <Link href="/coordinator" className="flex items-center gap-2" onClick={handleLinkClick}>
                    <div className="w-7 h-7 bg-[#E53935] rounded-md flex items-center justify-center">
                        <span className="text-white font-bold text-sm">E</span>
                    </div>
                    <span className="font-semibold text-base">Eventu</span>
                </Link>
                <span className="ml-auto px-1.5 py-0.5 bg-amber-500/15 text-amber-400 text-[10px] font-medium rounded">
                    COORD
                </span>
                {/* Close button for mobile */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 ml-2"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 overflow-y-auto">
                {/* Main Navigation */}
                <div className="px-3 mb-1">
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider px-2">Menu</span>
                </div>
                <ul className="space-y-0.5 px-2">
                    {mainNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    onClick={handleLinkClick}
                                    className={cn(
                                        'flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all text-[13px]',
                                        isActive
                                            ? 'bg-white/10 text-white'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{item.name}</span>
                                    {item.badge && (
                                        <span className="ml-auto text-[9px] font-semibold bg-[#E53935]/20 text-[#E53935] px-1.5 py-0.5 rounded">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Event Context Menu */}
                {eventId && currentEvent && (
                    <>
                        <div className="mx-3 my-3 border-t border-white/5" />

                        {/* Current Event Header */}
                        <div className="px-2 mb-1">
                            <button
                                onClick={() => setIsEventMenuExpanded(!isEventMenuExpanded)}
                                className="w-full flex items-center justify-between px-2.5 py-2 bg-[#E53935]/10 rounded-md text-[#E53935] hover:bg-[#E53935]/15 transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="font-medium truncate text-xs">
                                        {currentEvent.name}
                                    </span>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        'w-3.5 h-3.5 flex-shrink-0 transition-transform',
                                        isEventMenuExpanded && 'rotate-180'
                                    )}
                                />
                            </button>
                        </div>

                        {/* Event Submenu */}
                        {isEventMenuExpanded && (
                            <ul className="space-y-0.5 px-2">
                                <li>
                                    <Link
                                        href="/coordinator/eventos"
                                        onClick={handleLinkClick}
                                        className="flex items-center gap-2 px-2.5 py-1.5 text-gray-500 hover:text-gray-300 text-xs"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                        Volver
                                    </Link>
                                </li>
                                {eventNavigation.map((item) => {
                                    if (!hasPermission(item.permission)) return null;

                                    const href = `/coordinator/eventos/${eventId}${item.href}`;
                                    const isActive = pathname === href ||
                                        (item.href === '' && pathname === `/coordinator/eventos/${eventId}`);
                                    const Icon = item.icon;

                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={href}
                                                onClick={handleLinkClick}
                                                className={cn(
                                                    'flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all text-[13px]',
                                                    isActive
                                                        ? 'bg-[#E53935] text-white'
                                                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="font-medium">{item.name}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </>
                )}
            </nav>

            {/* User section */}
            <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-semibold text-amber-400">
                            {user.name?.charAt(0).toUpperCase() || 'C'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-gray-200">{user.name || 'Coordinador'}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                        href="/"
                        className="p-1.5 text-gray-500 hover:text-white rounded-md hover:bg-white/5 transition-colors"
                        title="Cerrar sesion"
                    >
                        <LogOut className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-56 bg-[#111318] text-white flex-col min-h-screen sticky top-0">
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
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#111318] text-white flex flex-col animate-in slide-in-from-left duration-300">
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
            <Menu className="w-5 h-5" />
        </button>
    );
}
