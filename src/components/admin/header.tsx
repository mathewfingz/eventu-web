'use client';

import { Bell, Search, ChevronDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AdminHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
}

export function AdminHeader({ user }: AdminHeaderProps) {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-4 flex-1">
                <Link
                    href="/"
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver</span>
                </Link>

                {/* Search */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar usuarios, eventos, órdenes..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] transition-colors"
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-500">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-4 ml-6">
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#E53935] rounded-full"></span>
                    </button>

                    {/* User dropdown */}
                    <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-[#E53935] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {user.name?.charAt(0).toUpperCase() || 'A'}
                            </span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            {user.name || 'Admin'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>
        </header>
    );
}
