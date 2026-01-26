'use client';

import { Bell, Search, ChevronDown, ArrowLeft, Menu } from 'lucide-react';
import Link from 'next/link';

interface AdminHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
    onMenuClick?: () => void;
}

export function AdminHeader({ user, onMenuClick }: AdminHeaderProps) {
    return (
        <header className="h-14 lg:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
            <div className="flex items-center gap-2 lg:gap-4 flex-1">
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
                <Link href="/admin" className="lg:hidden flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#E53935] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">E</span>
                    </div>
                </Link>

                <Link
                    href="/"
                    className="hidden lg:flex p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors items-center gap-2 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver</span>
                </Link>

                {/* Search - hidden on mobile */}
                <div className="hidden md:block flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar usuarios, eventos, órdenes..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] transition-colors"
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-500 hidden lg:inline">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2 lg:gap-4 ml-auto">
                    {/* Mobile search button */}
                    <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#E53935] rounded-full"></span>
                    </button>

                    {/* User dropdown - simplified on mobile */}
                    <button className="flex items-center gap-2 p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-[#E53935] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {user.name?.charAt(0).toUpperCase() || 'A'}
                            </span>
                        </div>
                        <span className="hidden lg:inline text-sm font-medium text-gray-700">
                            {user.name || 'Admin'}
                        </span>
                        <ChevronDown className="hidden lg:inline w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>
        </header>
    );
}
