'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, Menu, Building2, ChevronDown } from 'lucide-react';

interface OrganizerHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
    onMenuClick?: () => void;
}

export function OrganizerHeader({ user, onMenuClick }: OrganizerHeaderProps) {
    const pathname = usePathname();

    // Get page title based on pathname
    const getPageTitle = () => {
        if (pathname === '/organizer') return 'Dashboard';
        if (pathname === '/organizer/events') return 'Mis Eventos';
        if (pathname === '/organizer/events/new') return 'Crear Evento';
        if (pathname === '/organizer/settlements') return 'Liquidaciones';
        if (pathname === '/organizer/analytics') return 'Analytics';
        if (pathname === '/organizer/settings') return 'Configuración';
        return 'Organizador';
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
                <Link href="/organizer" className="lg:hidden flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#E53935] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">E</span>
                    </div>
                </Link>

                {/* Page title */}
                <h1 className="hidden sm:block text-lg font-semibold text-gray-900">
                    {getPageTitle()}
                </h1>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 lg:gap-4">
                {/* Search */}
                <div className="hidden md:block relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar eventos..."
                        className="w-64 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    />
                </div>

                {/* Mobile search button */}
                <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Search className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E53935] rounded-full"></span>
                </button>

                {/* User dropdown */}
                <button className="flex items-center gap-2 p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="hidden lg:inline text-sm font-medium text-gray-700">
                        {user.name || 'Organizador'}
                    </span>
                    <ChevronDown className="hidden lg:inline w-4 h-4 text-gray-500" />
                </button>
            </div>
        </header>
    );
}
