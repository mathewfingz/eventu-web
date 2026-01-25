'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket, CreditCard, Mail, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    eventName: string;
    onSuccess: (presale: any) => void;
}

type ValidationMethod = 'code' | 'card' | 'email';

export function PresaleModal({
    isOpen,
    onClose,
    eventId,
    eventName,
    onSuccess,
}: PresaleModalProps) {
    const [method, setMethod] = useState<ValidationMethod>('code');
    const [code, setCode] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleValidate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let response;

            if (method === 'code') {
                response = await fetch('/api/presale/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId, type: 'CODE', value: code }),
                });
            } else if (method === 'card') {
                // Get first 6 digits as BIN
                const bin = cardNumber.replace(/\s/g, '').substring(0, 6);
                response = await fetch('/api/presale/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId, type: 'BIN', value: bin }),
                });
            } else {
                // Email validation uses logged-in user's email
                response = await fetch('/api/presale/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId, type: 'EMAIL_DOMAIN' }),
                });
            }

            const data = await response.json();

            if (data.valid) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess(data.presale);
                    onClose();
                }, 1500);
            } else {
                setError(data.error?.message || 'Acceso no válido');
            }
        } catch (err) {
            setError('Error al validar. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const methods = [
        { id: 'code', label: 'Código', icon: Ticket },
        { id: 'card', label: 'Tarjeta', icon: CreditCard },
        { id: 'email', label: 'Email', icon: Mail },
    ] as const;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-[#E53935] to-[#B71C1C] p-6 text-white">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-6 h-6" />
                            <span className="text-sm font-medium uppercase tracking-wide opacity-90">
                                Preventa Exclusiva
                            </span>
                        </div>
                        <h2 className="text-xl font-bold font-[Poppins,sans-serif]">
                            {eventName}
                        </h2>
                    </div>

                    {/* Success State */}
                    {success ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#212121] mb-2">
                                ¡Acceso confirmado!
                            </h3>
                            <p className="text-[#757575]">
                                Redirigiendo a la preventa...
                            </p>
                        </motion.div>
                    ) : (
                        <div className="p-6">
                            {/* Method Selector */}
                            <div className="flex gap-2 mb-6">
                                {methods.map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => setMethod(id)}
                                        className={cn(
                                            'flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                                            method === id
                                                ? 'border-[#E53935] bg-[#E53935]/5'
                                                : 'border-gray-100 hover:border-gray-200'
                                        )}
                                    >
                                        <Icon className={cn(
                                            'w-5 h-5',
                                            method === id ? 'text-[#E53935]' : 'text-gray-400'
                                        )} />
                                        <span className={cn(
                                            'text-xs font-medium',
                                            method === id ? 'text-[#E53935]' : 'text-[#757575]'
                                        )}>
                                            {label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Input Fields */}
                            {method === 'code' && (
                                <div>
                                    <label className="block text-sm font-medium text-[#212121] mb-2">
                                        Ingresa tu código de preventa
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="Ej: PREVENTA2026"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                        maxLength={20}
                                    />
                                </div>
                            )}

                            {method === 'card' && (
                                <div>
                                    <label className="block text-sm font-medium text-[#212121] mb-2">
                                        Primeros 6 dígitos de tu tarjeta
                                    </label>
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').substring(0, 6);
                                            setCardNumber(value);
                                        }}
                                        placeholder="5303 12"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                        maxLength={6}
                                    />
                                    <p className="mt-2 text-xs text-[#757575] text-center">
                                        Solo verificamos acceso, no guardamos tu número
                                    </p>
                                </div>
                            )}

                            {method === 'email' && (
                                <div className="text-center py-4">
                                    <Mail className="w-12 h-12 text-[#E53935] mx-auto mb-3" />
                                    <p className="text-[#757575]">
                                        Verificaremos si tu email tiene acceso a preventas exclusivas
                                    </p>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                onClick={handleValidate}
                                disabled={isLoading || (method === 'code' && !code) || (method === 'card' && cardNumber.length < 6)}
                                className="w-full mt-6 flex items-center justify-center gap-2 py-4 bg-[#E53935] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Verificar acceso
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <p className="mt-4 text-xs text-center text-[#757575]">
                                ¿No tienes código? <a href="#" className="text-[#E53935]">Conoce cómo obtener acceso</a>
                            </p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
