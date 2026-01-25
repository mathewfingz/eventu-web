'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Users, Ticket, ArrowRight } from 'lucide-react';

interface QueuePageProps {
    params: { eventId: string };
}

export default function QueuePage({ params }: QueuePageProps) {
    const router = useRouter();
    const [position, setPosition] = useState<number | null>(null);
    const [estimatedWait, setEstimatedWait] = useState<number>(0);
    const [totalWaiting, setTotalWaiting] = useState<number>(0);
    const [isAdmitted, setIsAdmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${seconds} segundos`;
        if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutos`;
        return `${Math.floor(seconds / 3600)}h ${Math.ceil((seconds % 3600) / 60)}min`;
    };

    const joinQueue = useCallback(async () => {
        try {
            const response = await fetch(`/api/events/${params.eventId}/queue/join`, {
                method: 'POST',
            });

            const data = await response.json();

            if (data.status === 'admitted') {
                setIsAdmitted(true);
                // Redirect to ticket selection after short delay
                setTimeout(() => {
                    router.push(`/events/${params.eventId}/tickets`);
                }, 2000);
            } else if (data.position) {
                setPosition(data.position);
                setEstimatedWait(data.estimatedWait);
                setTotalWaiting(data.totalWaiting);
            }
        } catch (err) {
            setError('Error al unirse a la cola');
        }
    }, [params.eventId, router]);

    const checkPosition = useCallback(async () => {
        try {
            const response = await fetch(`/api/events/${params.eventId}/queue/status`);
            const data = await response.json();

            if (data.status === 'admitted') {
                setIsAdmitted(true);
                setTimeout(() => {
                    router.push(`/events/${params.eventId}/tickets`);
                }, 2000);
            } else if (data.position) {
                setPosition(data.position);
                setEstimatedWait(data.estimatedWait);
                setTotalWaiting(data.totalWaiting);
            }
        } catch (err) {
            console.error('Error checking position:', err);
        }
    }, [params.eventId, router]);

    // Join queue on mount
    useEffect(() => {
        joinQueue();
    }, [joinQueue]);

    // Poll for position updates
    useEffect(() => {
        if (isAdmitted) return;

        const interval = setInterval(checkPosition, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [isAdmitted, checkPosition]);

    if (isAdmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#E53935] to-[#B71C1C] flex items-center justify-center px-4">
                <motion.div
                    className="text-center text-white"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <motion.div
                        className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <Ticket className="w-12 h-12 text-[#E53935]" />
                    </motion.div>

                    <h1 className="text-3xl font-bold mb-4 font-[Poppins,sans-serif]">
                        ¡Es tu turno!
                    </h1>
                    <p className="text-white/80 mb-6">
                        Redirigiendo a la selección de boletas...
                    </p>

                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#212121] to-[#424242] flex flex-col items-center justify-center px-4">
            {/* Queue Animation */}
            <div className="relative mb-8">
                <motion.div
                    className="w-32 h-32 rounded-full border-4 border-[#E53935]/30"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                />
                <motion.div
                    className="absolute inset-0 w-32 h-32 rounded-full border-4 border-transparent border-t-[#E53935]"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white font-[Poppins,sans-serif]">
                        {position !== null ? `#${position}` : '...'}
                    </span>
                </div>
            </div>

            {/* Status */}
            <h1 className="text-2xl font-bold text-white mb-2 text-center font-[Poppins,sans-serif]">
                Estás en la cola
            </h1>

            <p className="text-white/60 text-center mb-8 max-w-sm">
                Mantén esta página abierta. Serás redirigido automáticamente cuando sea tu turno.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                    <Clock className="w-6 h-6 text-[#E53935] mx-auto mb-2" />
                    <p className="text-white font-semibold">
                        {formatTime(estimatedWait)}
                    </p>
                    <p className="text-white/60 text-sm">Tiempo estimado</p>
                </div>

                <div className="bg-white/10 rounded-xl p-4 text-center">
                    <Users className="w-6 h-6 text-[#E53935] mx-auto mb-2" />
                    <p className="text-white font-semibold">
                        {totalWaiting.toLocaleString()}
                    </p>
                    <p className="text-white/60 text-sm">En espera</p>
                </div>
            </div>

            {/* Progress bar */}
            {position !== null && totalWaiting > 0 && (
                <div className="w-full max-w-sm">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-[#E53935]"
                            initial={{ width: 0 }}
                            animate={{
                                width: `${Math.max(5, 100 - ((position / totalWaiting) * 100))}%`
                            }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-white/40">
                        <span>Entrada</span>
                        <span>Tu posición</span>
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="mt-8 p-4 bg-white/5 rounded-xl max-w-sm">
                <p className="text-white/60 text-sm text-center">
                    💡 <strong>Tip:</strong> No recargues la página o perderás tu lugar en la cola.
                </p>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-500/20 rounded-xl text-red-300 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
}
