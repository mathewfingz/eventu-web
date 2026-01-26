'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, User, ShoppingCart, ShieldCheck, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
    isLoggedIn?: boolean;
    userName?: string;
    cartCount?: number;
}

export function Header({ isLoggedIn = false, userName, cartCount = 0 }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

                        <Link
                            href="/sell-with-us"
                            className="text-[#212121] hover:text-[#E53935] transition-colors font-medium flex items-center gap-1.5"
                        >
                            <Store className="w-4 h-4" />
                            Vende con Nosotros
                        </Link>

                        <Link
                            href="/trust"
                            className="text-[#212121] hover:text-[#E53935] transition-colors font-medium flex items-center gap-1.5"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Eventu Confiable
                        </Link>
                    </nav>

                    {/* Desktop right side */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Carrito"
                        >
                            <ShoppingCart className="w-5 h-5 text-[#757575]" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#E53935] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Auth buttons */}
                        {isLoggedIn ? (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors"
                            >
                                <User className="w-4 h-4" />
                                <span>{userName || 'Mi Cuenta'}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors font-medium"
                            >
                                <User className="w-4 h-4" />
                                Mi Cuenta
                            </Link>
                        )}
                    </div>

                    {/* Mobile right side */}
                    <div className="flex md:hidden items-center gap-2">
                        {/* Cart mobile */}
                        <Link
                            href="/cart"
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Carrito"
                        >
                            <ShoppingCart className="w-5 h-5 text-[#757575]" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#E53935] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
            </div>

            {/* Mobile menu */}
            <div className={cn(
                'md:hidden overflow-hidden transition-all duration-300',
                isMenuOpen ? 'max-h-[400px]' : 'max-h-0'
            )}>
                <div className="px-4 py-4 space-y-3 bg-gray-50">
                    <Link
                        href="/events"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-[#212121] hover:text-[#E53935] font-medium py-2"
                    >
                        Eventos
                    </Link>

                    <Link
                        href="/sell-with-us"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 text-[#212121] hover:text-[#E53935] font-medium py-2"
                    >
                        <Store className="w-4 h-4" />
                        Vende con Nosotros
                    </Link>

                    <Link
                        href="/trust"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 text-[#212121] hover:text-[#E53935] font-medium py-2"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Eventu Confiable
                    </Link>

                    <hr className="border-gray-200" />

                    {isLoggedIn ? (
                        <Link
                            href="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors font-medium"
                        >
                            <User className="w-4 h-4" />
                            Mi Cuenta
                        </Link>
                    ) : (
                        <Link
                            href="/auth/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors font-medium"
                        >
                            <User className="w-4 h-4" />
                            Mi Cuenta
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
