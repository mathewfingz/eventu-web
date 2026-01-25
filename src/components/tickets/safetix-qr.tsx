'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wifi,
    WifiOff,
    RefreshCw,
    Shield,
    AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';

interface SafeTixQRProps {
    ticketId: string;
    eventName: string;
    section?: string;
    seatInfo?: string;
    refreshInterval?: number; // seconds, default 15
    onCodeGenerated?: (code: string) => void;
}

/**
 * SafeTix Dynamic QR Component
 * 
 * Generates TOTP-based QR codes that rotate every 15 seconds,
 * making screenshot fraud impossible.
 */
export function SafeTixQR({
    ticketId,
    eventName,
    section,
    seatInfo,
    refreshInterval = 15,
    onCodeGenerated,
}: SafeTixQRProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [currentCode, setCurrentCode] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState(refreshInterval);
    const [isOffline, setIsOffline] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const offlineCodesRef = useRef<{ code: string; validUntil: number }[]>([]);
    const offlineIndexRef = useRef(0);

    // Generate QR code data URL
    const generateQRDataUrl = useCallback(async (code: string): Promise<string> => {
        const payload = JSON.stringify({
            ticketId,
            code,
            timestamp: Date.now(),
            offline: isOffline,
        });

        return QRCode.toDataURL(payload, {
            width: 280,
            margin: 2,
            color: {
                dark: '#212121',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
        });
    }, [ticketId, isOffline]);

    // Fetch new code from server
    const fetchNewCode = useCallback(async () => {
        try {
            const response = await fetch(`/api/tickets/${ticketId}/qr`);

            if (!response.ok) {
                throw new Error('Failed to fetch code');
            }

            const data = await response.json();

            if (data.code) {
                setCurrentCode(data.code);
                const qr = await generateQRDataUrl(data.code);
                setQrDataUrl(qr);
                setTimeLeft(refreshInterval);
                setIsOffline(false);
                setError(null);
                onCodeGenerated?.(data.code);

                // Store offline codes if provided
                if (data.offlineCodes) {
                    offlineCodesRef.current = data.offlineCodes;
                    offlineIndexRef.current = 0;

                    // Save to localStorage for true offline access
                    localStorage.setItem(
                        `safetix_${ticketId}`,
                        JSON.stringify(data.offlineCodes)
                    );
                }
            }
        } catch (err) {
            console.warn('[SafeTix] Server unavailable, switching to offline mode');
            await useOfflineCode();
        } finally {
            setIsLoading(false);
        }
    }, [ticketId, refreshInterval, generateQRDataUrl, onCodeGenerated]);

    // Use pre-generated offline code
    const useOfflineCode = useCallback(async () => {
        // Try to get codes from ref first, then localStorage
        let codes = offlineCodesRef.current;

        if (codes.length === 0) {
            const stored = localStorage.getItem(`safetix_${ticketId}`);
            if (stored) {
                codes = JSON.parse(stored);
                offlineCodesRef.current = codes;
            }
        }

        if (codes.length === 0) {
            setError('Sin conexión y sin códigos offline');
            return;
        }

        // Find valid code for current time
        const now = Date.now();
        const validCode = codes.find(c => c.validUntil > now);

        if (!validCode) {
            setError('Códigos offline expirados. Conéctate a internet.');
            return;
        }

        setCurrentCode(validCode.code);
        const qr = await generateQRDataUrl(validCode.code);
        setQrDataUrl(qr);
        setIsOffline(true);
        setError(null);

        // Calculate time left for this code
        const remaining = Math.max(0, Math.floor((validCode.validUntil - now) / 1000));
        setTimeLeft(Math.min(remaining, refreshInterval));

        // Move to next code for next rotation
        offlineIndexRef.current++;
    }, [ticketId, refreshInterval, generateQRDataUrl]);

    // Check online status
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            fetchNewCode();
        };

        const handleOffline = () => {
            setIsOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [fetchNewCode]);

    // Initial fetch
    useEffect(() => {
        fetchNewCode();
    }, [fetchNewCode]);

    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Time to refresh
                    if (isOffline) {
                        useOfflineCode();
                    } else {
                        fetchNewCode();
                    }
                    return refreshInterval;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [refreshInterval, isOffline, fetchNewCode, useOfflineCode]);

    // Progress percentage for the countdown ring
    const progress = (timeLeft / refreshInterval) * 100;

    return (
        <div className="flex flex-col items-center">
            {/* Status indicator */}
            <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4',
                isOffline
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
            )}>
                {isOffline ? (
                    <>
                        <WifiOff className="w-3.5 h-3.5" />
                        Modo Offline
                    </>
                ) : (
                    <>
                        <Wifi className="w-3.5 h-3.5" />
                        Conectado
                    </>
                )}
            </div>

            {/* QR Container */}
            <div className="relative">
                {/* Countdown ring */}
                <svg
                    className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)]"
                    viewBox="0 0 100 100"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="#E53935"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 48}`}
                        strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
                        transform="rotate(-90 50 50)"
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: `${2 * Math.PI * 48 * (1 - progress / 100)}` }}
                        transition={{ duration: 0.5, ease: "linear" }}
                    />
                </svg>

                {/* QR Code */}
                <div className="relative bg-white p-4 rounded-2xl shadow-lg">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-[248px] h-[248px] flex items-center justify-center"
                            >
                                <RefreshCw className="w-8 h-8 text-[#E53935] animate-spin" />
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-[248px] h-[248px] flex flex-col items-center justify-center text-center p-4"
                            >
                                <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                                <p className="text-red-600 text-sm">{error}</p>
                                <button
                                    onClick={fetchNewCode}
                                    className="mt-4 px-4 py-2 bg-[#E53935] text-white rounded-lg text-sm font-medium"
                                >
                                    Reintentar
                                </button>
                            </motion.div>
                        ) : (
                            <motion.img
                                key={currentCode}
                                src={qrDataUrl}
                                alt="SafeTix QR Code"
                                className="w-[248px] h-[248px]"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Timer */}
            <div className="mt-4 flex items-center gap-2 text-sm">
                <RefreshCw className={cn(
                    "w-4 h-4",
                    timeLeft <= 3 && "text-[#E53935] animate-spin"
                )} />
                <span className="text-[#757575]">
                    Nuevo código en <strong className="text-[#212121]">{timeLeft}s</strong>
                </span>
            </div>

            {/* Ticket Info */}
            <div className="mt-6 text-center">
                <h3 className="font-semibold text-[#212121]">{eventName}</h3>
                {section && (
                    <p className="text-sm text-[#757575]">{section}</p>
                )}
                {seatInfo && (
                    <p className="text-sm text-[#757575]">{seatInfo}</p>
                )}
            </div>

            {/* Security badge */}
            <div className="mt-4 flex items-center gap-2 text-xs text-[#757575]">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Protegido con SafeTix</span>
            </div>
        </div>
    );
}
