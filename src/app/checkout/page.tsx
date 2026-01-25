'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Clock, Shield, Loader2 } from 'lucide-react';
import {
    getAvailablePaymentMethods,
    calculateFees,
    SupportedPaymentMethod
} from '@/lib/payments';
import { formatPrice } from '@/lib/utils';

// Mock order data - will come from props/database
const mockOrder = {
    id: 'order_123',
    event: {
        name: 'Bad Bunny - World Tour 2026',
        date: '15 Feb, 2026 - 8:00 PM',
        venue: 'Estadio El Campín, Bogotá',
        imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=200&fit=crop',
    },
    items: [
        { name: 'VIP', quantity: 2, unitPrice: 350000 },
    ],
    subtotal: 700000,
};

export default function CheckoutPage() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<SupportedPaymentMethod | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const paymentMethods = getAvailablePaymentMethods();
    const fees = calculateFees(mockOrder.subtotal);

    const handlePayment = async () => {
        if (!selectedMethod) {
            setError('Por favor selecciona un método de pago');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Call API to create payment
            const response = await fetch('/api/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: mockOrder.id,
                    amount: fees.total,
                    method: selectedMethod,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.error?.message || 'Error al procesar el pago');
                return;
            }

            // Redirect to payment page or show QR
            if (data.paymentIntent.redirectUrl) {
                window.location.href = data.paymentIntent.redirectUrl;
            } else if (data.paymentIntent.qrCode) {
                // Show QR modal for Nequi
                router.push(`/checkout/nequi?payment=${data.paymentIntent.id}`);
            }
        } catch (err) {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link
                        href="/events"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-semibold">Checkout</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left: Payment Methods */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Order Summary Card */}
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex gap-4">
                                <img
                                    src={mockOrder.event.imageUrl}
                                    alt={mockOrder.event.name}
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <h2 className="font-semibold text-[#212121]">{mockOrder.event.name}</h2>
                                    <p className="text-sm text-[#757575]">{mockOrder.event.date}</p>
                                    <p className="text-sm text-[#757575]">{mockOrder.event.venue}</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                {mockOrder.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold text-lg mb-4">Método de pago</h3>

                            <div className="space-y-3">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.method}
                                        onClick={() => setSelectedMethod(method.method)}
                                        disabled={!method.available}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedMethod === method.method
                                                ? 'border-[#E53935] bg-[#E53935]/5'
                                                : 'border-gray-100 hover:border-gray-200'
                                            } ${!method.available && 'opacity-50 cursor-not-allowed'}`}
                                    >
                                        <span className="text-2xl">{method.icon}</span>
                                        <span className="flex-1 text-left font-medium">{method.label}</span>
                                        {selectedMethod === method.method && (
                                            <div className="w-6 h-6 bg-[#E53935] rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Security Info */}
                        <div className="flex items-center gap-3 text-sm text-[#757575]">
                            <Shield className="w-5 h-5 text-green-600" />
                            <span>Pago 100% seguro. Tus datos están protegidos.</span>
                        </div>
                    </div>

                    {/* Right: Order Total */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="font-semibold text-lg mb-4">Resumen</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[#757575]">Subtotal</span>
                                    <span>{formatPrice(fees.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#757575]">Cargo por servicio</span>
                                    <span>{formatPrice(fees.serviceFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#757575]">IVA (19%)</span>
                                    <span>{formatPrice(fees.iva)}</span>
                                </div>

                                <hr className="border-gray-100" />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-[#E53935]">{formatPrice(fees.total)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isLoading || !selectedMethod}
                                className="w-full mt-6 py-4 bg-[#E53935] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    `Pagar ${formatPrice(fees.total)}`
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#757575]">
                                <Clock className="w-4 h-4" />
                                <span>Tienes 10 minutos para completar tu pago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
