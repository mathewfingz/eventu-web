'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setIsLoading(false);
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setIsLoading(false);
            return;
        }

        try {
            const supabase = getSupabaseBrowserClient();

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                },
            });

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    setError('Este correo ya está registrado. Intenta iniciar sesión.');
                } else {
                    setError(signUpError.message);
                }
                return;
            }

            if (data.user) {
                setSuccess(true);
            }
        } catch (err) {
            setError('Error al crear la cuenta. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#212121] mb-4">¡Cuenta creada!</h2>
                    <p className="text-[#757575] mb-6">
                        Hemos enviado un correo de confirmación a <strong>{email}</strong>.
                        Por favor, verifica tu correo para activar tu cuenta.
                    </p>
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#E53935] text-white rounded-lg font-semibold hover:bg-[#B71C1C] transition-colors"
                    >
                        Ir a iniciar sesión
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E53935] to-[#B71C1C]">
                    <div className="absolute inset-0 bg-black/20" />
                    <img
                        src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=1200&fit=crop"
                        alt="Concierto"
                        className="w-full h-full object-cover mix-blend-overlay opacity-60"
                    />
                </div>

                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-white text-center max-w-md">
                        <h3 className="text-4xl font-bold mb-4 font-[Poppins,sans-serif]">
                            Únete a Eventu
                        </h3>
                        <p className="text-lg opacity-90">
                            Miles de eventos te esperan. Conciertos, festivales, teatro y mucho más.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Logo */}
                    <div className="text-center">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="w-12 h-12 bg-[#E53935] rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                E
                            </div>
                            <span className="text-3xl font-bold text-[#E53935] font-[Poppins,sans-serif]">
                                Eventu
                            </span>
                        </Link>

                        <h2 className="mt-6 text-3xl font-bold text-[#212121]">
                            Crea tu cuenta
                        </h2>
                        <p className="mt-2 text-[#757575]">
                            Empieza a disfrutar de los mejores eventos
                        </p>
                    </div>

                    {/* Form */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-[#212121] mb-2">
                                    Nombre completo
                                </label>
                                <div className="relative">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                        placeholder="Tu nombre"
                                    />
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[#212121] mb-2">
                                    Correo electrónico
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                        placeholder="tu@email.com"
                                    />
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-[#212121] mb-2">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 pl-11 pr-11 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#212121] mb-2">
                                    Confirmar contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                        placeholder="Repite tu contraseña"
                                    />
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <p className="text-sm text-[#757575]">
                            Al registrarte, aceptas nuestros{' '}
                            <Link href="/terms" className="text-[#E53935] hover:underline">Términos</Link>
                            {' '}y{' '}
                            <Link href="/privacy" className="text-[#E53935] hover:underline">Política de Privacidad</Link>
                        </p>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#E53935] text-white rounded-lg font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Crear cuenta
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login link */}
                    <p className="text-center text-[#757575]">
                        ¿Ya tienes cuenta?{' '}
                        <Link
                            href="/auth/login"
                            className="text-[#E53935] hover:text-[#B71C1C] font-medium"
                        >
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
