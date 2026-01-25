'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search, User, Moon, Sun, LayoutDashboard, Ticket, Building2, ScanLine, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
    isLoggedIn?: boolean;
    userName?: string;
}

const dashboardLinks = [
    { label: 'Mi Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Panel principal' },
    { label: 'Mis Boletas', href: '/dashboard/tickets', icon: Ticket, description: 'Ver tus tickets' },
    { label: 'Panel Organizador', href: '/organizer/settlements', icon: Building2, description: 'Liquidaciones' },
    { label: 'Escáner', href: '/coordinator/scanner', icon: ScanLine, description: 'Escanear entradas' },
];

export function Header({ isLoggedIn = false, userName }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#E53935] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            E
                        </div>
                        <span className="text-xl font-bold text-[#E53935] font-[Poppins,sans-serif]">
                            Eventu
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/events"
                            className="text-[#212121] hover:text-[#E53935] transition-colors font-medium"
                        >
                            Eventos
                        </Link>

                        {/* Dashboards Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsDashboardOpen(true)}
                            onMouseLeave={() => setIsDashboardOpen(false)}
                        >
                            <button className="flex items-center gap-1 text-[#212121] hover:text-[#E53935] transition-colors font-medium">
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboards
                                <ChevronDown className={cn(
                                    "w-4 h-4 transition-transform",
                                    isDashboardOpen && "rotate-180"
                                )} />
                            </button>

                            {/* Dropdown Menu */}
                            <div className={cn(
                                "absolute left-0 top-full pt-2 transition-all duration-200",
                                isDashboardOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                            )}>
                                <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[240px]">
                                    {dashboardLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="p-2 bg-[#E53935]/10 rounded-lg group-hover:bg-[#E53935] transition-colors">
                                                <link.icon className="w-4 h-4 text-[#E53935] group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#212121] text-sm">{link.label}</p>
                                                <p className="text-xs text-gray-500">{link.description}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <button className="text-[#212121] hover:text-[#E53935] transition-colors font-medium flex items-center gap-1">
                                Categorías
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </nav>

                    {/* Desktop right side */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Search */}
                        <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Buscar"
                        >
                            <Search className="w-5 h-5 text-[#757575]" />
                        </button>

                        {/* Dark mode toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Cambiar tema"
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5 text-[#757575]" />
                            ) : (
                                <Moon className="w-5 h-5 text-[#757575]" />
                            )}
                        </button>

                        {/* Auth buttons */}
                        {isLoggedIn ? (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors"
                            >
                                <User className="w-4 h-4" />
                                <span>{userName || 'Mi cuenta'}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors font-medium"
                            >
                                Iniciar sesión
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={cn(
                'md:hidden overflow-hidden transition-all duration-300',
                isMenuOpen ? 'max-h-[500px]' : 'max-h-0'
            )}>
                <div className="px-4 py-4 space-y-4 bg-gray-50">
                    <Link
                        href="/events"
                        className="block text-[#212121] hover:text-[#E53935] font-medium"
                    >
                        Eventos
                    </Link>

                    {/* Mobile Dashboards Section */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-[#E53935] flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboards
                        </p>
                        <div className="pl-6 space-y-2">
                            {dashboardLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-2 text-[#212121] hover:text-[#E53935] text-sm"
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <Link
                        href="/categories"
                        className="block text-[#212121] hover:text-[#E53935] font-medium"
                    >
                        Categorías
                    </Link>

                    <hr className="border-gray-200" />

                    {isLoggedIn ? (
                        <Link
                            href="/dashboard"
                            className="block w-full text-center px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors"
                        >
                            Mi cuenta
                        </Link>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="block w-full text-center px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors"
                        >
                            Iniciar sesión
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

