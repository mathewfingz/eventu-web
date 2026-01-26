'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, Menu, User } from 'lucide-react';

interface DashboardHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
        avatar_url?: string | null;
    };
    onMenuClick?: () => void;
}

export function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
    const pathname = usePathname();

    // Get page title based on pathname
    const getPageTitle = () => {
        if (pathname === '/dashboard') return 'Mi Dashboard';
        if (pathname === '/dashboard/tickets') return 'Mis Boletas';
        if (pathname === '/dashboard/events') return 'Próximos Eventos';
        if (pathname === '/dashboard/favorites') return 'Mis Favoritos';
        if (pathname === '/dashboard/settings') return 'Configuración';
        return 'Dashboard';
    };

    return (
        <header className="h-14 lg:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
            <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                )}

                {/* Mobile logo */}
                <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#E53935] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">E</span>
                    </div>
                </Link>

                {/* Page title - hidden on mobile */}
                <h1 className="hidden lg:block text-lg font-semibold text-gray-900">
                    {getPageTitle()}
                </h1>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 lg:gap-4">
                {/* Search button */}
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Search className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E53935] rounded-full"></span>
                </button>

                {/* User avatar - visible only on larger screens since it's in sidebar too */}
                <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200">
                    <div className="w-8 h-8 bg-[#E53935]/10 rounded-full flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={user.name || 'Usuario'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-4 h-4 text-[#E53935]" />
                        )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                        {user.name?.split(' ')[0] || 'Usuario'}
                    </span>
                </div>
            </div>
        </header>
    );
}
