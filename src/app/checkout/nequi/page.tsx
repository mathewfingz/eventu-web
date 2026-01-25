'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Smartphone,
  AlertCircle,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

function NequiCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment') || 'mock_payment_123';

  const [status, setStatus] = useState<PaymentStatus>('PENDING');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isPolling, setIsPolling] = useState(true);

  // Mock payment data
  const paymentData = {
    amount: 750000,
    orderId: 'ORD-123456',
    eventName: 'Bad Bunny - World Tour 2026',
    nequiCode: '3001234567', // Mock Nequi phone number
  };

  // Countdown timer
  useEffect(() => {
    if (status !== 'PENDING' && status !== 'PROCESSING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus('EXPIRED');
          setIsPolling(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Simulated polling for payment status
  useEffect(() => {
    if (!isPolling) return;

    const pollInterval = setInterval(() => {
      // In production, this would call the API to check payment status
      // For demo, we'll simulate a successful payment after 10 seconds
      console.log('Checking payment status...');
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [isPolling]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Demo: Simulate payment completion
  const simulatePayment = (success: boolean) => {
    setStatus('PROCESSING');
    setTimeout(() => {
      if (success) {
        setStatus('COMPLETED');
        setIsPolling(false);
        setTimeout(() => {
          router.push('/checkout/success');
        }, 2000);
      } else {
        setStatus('FAILED');
        setIsPolling(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Pago con Nequi</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Status Header */}
          <div
            className={`p-6 text-center ${
              status === 'COMPLETED'
                ? 'bg-green-500'
                : status === 'FAILED' || status === 'EXPIRED'
                ? 'bg-red-500'
                : 'bg-[#E53935]'
            }`}
          >
            {status === 'PENDING' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Esperando pago
                </h2>
                <p className="text-white/80">
                  Abre tu app Nequi y aprueba el pago
                </p>
              </>
            )}

            {status === 'PROCESSING' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Procesando pago
                </h2>
                <p className="text-white/80">
                  Estamos verificando tu pago...
                </p>
              </>
            )}

            {status === 'COMPLETED' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  ¡Pago exitoso!
                </h2>
                <p className="text-white/80">
                  Redirigiendo a confirmación...
                </p>
              </>
            )}

            {(status === 'FAILED' || status === 'EXPIRED') && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {status === 'EXPIRED' ? 'Tiempo expirado' : 'Pago fallido'}
                </h2>
                <p className="text-white/80">
                  {status === 'EXPIRED'
                    ? 'El tiempo para completar el pago ha expirado'
                    : 'No pudimos procesar tu pago'}
                </p>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Timer */}
            {(status === 'PENDING' || status === 'PROCESSING') && (
              <div className="flex items-center justify-center gap-2 text-lg font-mono mb-6">
                <Clock className="w-5 h-5 text-gray-500" />
                <span
                  className={`font-bold ${
                    timeLeft < 60 ? 'text-red-500' : 'text-gray-900'
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
                <span className="text-gray-500">restantes</span>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500">Monto a pagar</span>
                <span className="text-2xl font-bold text-[#E53935]">
                  {formatPrice(paymentData.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Orden</span>
                <span className="font-mono text-gray-700">
                  {paymentData.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-500">Evento</span>
                <span className="text-gray-700">{paymentData.eventName}</span>
              </div>
            </div>

            {/* Instructions */}
            {status === 'PENDING' && (
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-900">
                  Pasos para pagar:
                </h3>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-[#E53935] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      1
                    </span>
                    <span className="text-gray-600">
                      Abre la app de <strong>Nequi</strong> en tu celular
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-[#E53935] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      2
                    </span>
                    <span className="text-gray-600">
                      Ve a la sección de <strong>Notificaciones</strong> o{' '}
                      <strong>Pagos pendientes</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-[#E53935] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      3
                    </span>
                    <span className="text-gray-600">
                      Busca el pago de <strong>Eventu</strong> por{' '}
                      <strong>{formatPrice(paymentData.amount)}</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-[#E53935] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      4
                    </span>
                    <span className="text-gray-600">
                      Confirma el pago con tu <strong>PIN de Nequi</strong>
                    </span>
                  </li>
                </ol>
              </div>
            )}

            {/* Demo buttons - only in development */}
            {status === 'PENDING' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">
                      Modo de demostración
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      En producción, el pago se verificaría automáticamente. Para
                      probar, usa los botones:
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => simulatePayment(true)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Simular éxito
                      </button>
                      <button
                        onClick={() => simulatePayment(false)}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Simular fallo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions for failed/expired */}
            {(status === 'FAILED' || status === 'EXPIRED') && (
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
                >
                  Intentar de nuevo
                </button>
                <Link
                  href="/events"
                  className="block w-full py-3 text-center border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Volver a eventos
                </Link>
              </div>
            )}

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Transacción segura con Nequi</span>
            </div>
          </div>
        </div>

        {/* Help Link */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            ¿Tienes problemas?{' '}
            <Link href="/contact" className="text-[#E53935] hover:underline">
              Contacta soporte
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function NequiCheckoutFallback() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#E53935] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function NequiCheckoutPage() {
  return (
    <Suspense fallback={<NequiCheckoutFallback />}>
      <NequiCheckoutContent />
    </Suspense>
  );
}
