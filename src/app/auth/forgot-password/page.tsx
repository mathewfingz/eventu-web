'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setErrorMessage('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!email.includes('@')) {
      setStatus('error');
      setErrorMessage('Por favor ingresa un correo electrónico válido');
      return;
    }

    setStatus('loading');

    // Simular envío de email
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E53935] to-[#B71C1C] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white font-[Poppins,sans-serif]">
              Eventu
            </h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {status === 'success' ? (
            /* Success State */
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Correo enviado!
              </h2>
              <p className="text-gray-600 mb-6">
                Hemos enviado un enlace de recuperación a{' '}
                <span className="font-medium text-gray-900">{email}</span>. Revisa tu
                bandeja de entrada.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
                <button
                  onClick={() => {
                    setStatus('idle');
                    setEmail('');
                  }}
                  className="text-[#E53935] font-medium hover:underline"
                >
                  intenta de nuevo
                </button>
              </p>
              <Link
                href="/auth/login"
                className="inline-block w-full py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors text-center"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="p-8">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Link>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¿Olvidaste tu contraseña?
                </h2>
                <p className="text-gray-600 mb-6">
                  No te preocupes, te enviaremos instrucciones para recuperar el acceso
                  a tu cuenta.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (status === 'error') setStatus('idle');
                        }}
                        placeholder="tu@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                      />
                    </div>
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      'Enviar enlace de recuperación'
                    )}
                  </button>
                </form>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                  ¿Recordaste tu contraseña?{' '}
                  <Link
                    href="/auth/login"
                    className="text-[#E53935] font-medium hover:underline"
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Help Link */}
        <div className="text-center mt-6">
          <Link href="/contact" className="text-white/80 hover:text-white text-sm">
            ¿Necesitas ayuda? Contacta soporte
          </Link>
        </div>
      </div>
    </div>
  );
}
