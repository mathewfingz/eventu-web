'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, User, ShoppingCart, ShieldCheck, Store, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
    isLoggedIn?: boolean;
    userName?: string;
    cartCount?: number;
}

export function Header({ isLoggedIn = false, userName, cartCount = 0 }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={cn(
                'sticky top-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-b border-white/20'
                    : 'bg-white/95 border-b border-gray-100/50'
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-[64px]">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#FF6B6B] to-[#E53935] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-[0_2px_8px_rgba(229,57,53,0.3)] group-hover:shadow-[0_4px_16px_rgba(229,57,53,0.4)] transition-shadow">
                            E
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-[#E53935] to-[#FF6B6B] bg-clip-text text-transparent">
                            Eventu
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        <Link
                            href="/events"
                            className="px-4 py-2 text-[#1D1D1F] hover:text-[#E53935] transition-colors font-medium text-[15px] rounded-lg hover:bg-[#E53935]/5"
                        >
                            Eventos
                        </Link>

                        <Link
                            href="/sell-with-us"
                            className="px-4 py-2 text-[#1D1D1F] hover:text-[#E53935] transition-colors font-medium text-[15px] rounded-lg hover:bg-[#E53935]/5 flex items-center gap-1.5"
                        >
                            <Store className="w-4 h-4" />
                            Vende con Nosotros
                        </Link>

                        <Link
                            href="/confiar"
                            className="px-4 py-2 text-[#1D1D1F] hover:text-[#E53935] transition-colors font-medium text-[15px] rounded-lg hover:bg-[#E53935]/5 flex items-center gap-1.5"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Eventu Confiable
                        </Link>
                    </nav>

                    {/* Desktop right side */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* Search button */}
                        <button
                            className="p-2.5 hover:bg-gray-100/80 rounded-xl transition-colors"
                            aria-label="Buscar"
                        >
                            <Search className="w-[18px] h-[18px] text-[#86868B]" />
                        </button>

                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="relative p-2.5 hover:bg-gray-100/80 rounded-xl transition-colors"
                            aria-label="Carrito"
                        >
                            <ShoppingCart className="w-[18px] h-[18px] text-[#86868B]" />
                            {cartCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#E53935] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_2px_4px_rgba(229,57,53,0.3)]"
                                >
                                    {cartCount > 9 ? '9+' : cartCount}
                                </motion.span>
                            )}
                        </Link>

                        {/* Divider */}
                        <div className="h-5 w-px bg-gray-200 mx-1" />

                        {/* Auth buttons */}
                        {isLoggedIn ? (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E53935] to-[#FF6B6B] text-white rounded-xl hover:shadow-[0_4px_16px_rgba(229,57,53,0.35)] transition-all font-medium text-sm"
                            >
                                <User className="w-4 h-4" />
                                <span>{userName || 'Mi Cuenta'}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#E53935] to-[#FF6B6B] text-white rounded-xl hover:shadow-[0_4px_16px_rgba(229,57,53,0.35)] transition-all font-medium text-sm"
                            >
                                <User className="w-3.5 h-3.5" />
                                Mi Cuenta
                            </Link>
                        )}
                    </div>

                    {/* Mobile right side */}
                    <div className="flex md:hidden items-center gap-1">
                        {/* Cart mobile */}
                        <Link
                            href="/cart"
                            className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            aria-label="Carrito"
                        >
                            <ShoppingCart className="w-5 h-5 text-[#86868B]" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#E53935] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5 text-[#1D1D1F]" />
                            ) : (
                                <Menu className="w-5 h-5 text-[#1D1D1F]" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100/50"
                    >
                        <div className="px-4 py-5 space-y-1">
                            <Link
                                href="/events"
                                onClick={() => setIsMenuOpen(false)}
                                className="block text-[#1D1D1F] hover:text-[#E53935] font-medium py-3 px-3 rounded-xl hover:bg-[#E53935]/5 transition-colors"
                            >
                                Eventos
                            </Link>

                            <Link
                                href="/sell-with-us"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-2.5 text-[#1D1D1F] hover:text-[#E53935] font-medium py-3 px-3 rounded-xl hover:bg-[#E53935]/5 transition-colors"
                            >
                                <Store className="w-4 h-4" />
                                Vende con Nosotros
                            </Link>

                            <Link
                                href="/confiar"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-2.5 text-[#1D1D1F] hover:text-[#E53935] font-medium py-3 px-3 rounded-xl hover:bg-[#E53935]/5 transition-colors"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Eventu Confiable
                            </Link>

                            <div className="h-px bg-gray-100 my-3" />

                            {isLoggedIn ? (
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-[#E53935] to-[#FF6B6B] text-white rounded-xl font-medium shadow-[0_4px_12px_rgba(229,57,53,0.25)]"
                                >
                                    <User className="w-4 h-4" />
                                    Mi Cuenta
                                </Link>
                            ) : (
                                <Link
                                    href="/auth/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-[#E53935] to-[#FF6B6B] text-white rounded-xl font-medium shadow-[0_4px_12px_rgba(229,57,53,0.25)]"
                                >
                                    <User className="w-4 h-4" />
                                    Mi Cuenta
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
