'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Camera,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Volume2,
    VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationResult {
    valid: boolean;
    ticket?: {
        id: string;
        type: string;
        section?: string;
        seatRow?: string;
        seatNumber?: string;
        event: string;
    };
    error?: string;
    errorCode?: string;
}

/**
 * SafeTix Scanner Component
 * 
 * Used by coordinators to validate tickets at venue entry
 */
export function SafeTixScanner() {
    const [isScanning, setIsScanning] = useState(false);
    const [lastResult, setLastResult] = useState<ValidationResult | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [stats, setStats] = useState({ validated: 0, rejected: 0 });

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Audio feedback
    const playSound = (type: 'success' | 'error') => {
        if (!soundEnabled) return;

        const audio = new Audio(
            type === 'success'
                ? '/sounds/success.mp3'
                : '/sounds/error.mp3'
        );
        audio.play().catch(() => { });
    };

    // Start camera
    const startScanning = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsScanning(true);
                scanFrame();
            }
        } catch (error) {
            console.error('[Scanner] Camera access denied:', error);
            alert('Por favor permite el acceso a la cámara para escanear boletas.');
        }
    };

    // Stop camera
    const stopScanning = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    };

    // Scan frames for QR codes
    const scanFrame = async () => {
        if (!videoRef.current || !canvasRef.current || !isScanning) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
            requestAnimationFrame(scanFrame);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Use BarcodeDetector API if available
        if ('BarcodeDetector' in window) {
            try {
                const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
                const barcodes = await detector.detect(imageData);

                if (barcodes.length > 0) {
                    const qrData = barcodes[0].rawValue;
                    await validateQRCode(qrData);
                    // Pause briefly after scanning
                    setTimeout(() => requestAnimationFrame(scanFrame), 2000);
                    return;
                }
            } catch (e) {
                // Fallback to other method if needed
            }
        }

        requestAnimationFrame(scanFrame);
    };

    // Validate scanned QR code
    const validateQRCode = async (rawData: string) => {
        try {
            const data = JSON.parse(rawData);
            const { ticketId, code } = data;

            if (!ticketId || !code) {
                setLastResult({
                    valid: false,
                    error: 'Código QR inválido',
                    errorCode: 'INVALID_QR',
                });
                playSound('error');
                return;
            }

            // Call validation API
            const response = await fetch('/api/tickets/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId,
                    code,
                    deviceId: navigator.userAgent,
                }),
            });

            const result: ValidationResult = await response.json();
            setLastResult(result);

            if (result.valid) {
                playSound('success');
                setStats(prev => ({ ...prev, validated: prev.validated + 1 }));
            } else {
                playSound('error');
                setStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));
            }
        } catch (error) {
            setLastResult({
                valid: false,
                error: 'Error al procesar el código',
                errorCode: 'PARSE_ERROR',
            });
            playSound('error');
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopScanning();
    }, []);

    return (
        <div className="min-h-screen bg-[#212121] text-white">
            {/* Header */}
            <header className="p-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Scanner SafeTix</h1>
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 hover:bg-white/10 rounded-lg"
                >
                    {soundEnabled ? (
                        <Volume2 className="w-6 h-6" />
                    ) : (
                        <VolumeX className="w-6 h-6" />
                    )}
                </button>
            </header>

            {/* Stats */}
            <div className="px-4 flex gap-4 mb-4">
                <div className="flex-1 bg-green-500/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-green-400">{stats.validated}</p>
                    <p className="text-xs text-green-400/80">Validados</p>
                </div>
                <div className="flex-1 bg-red-500/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                    <p className="text-xs text-red-400/80">Rechazados</p>
                </div>
            </div>

            {/* Camera viewport */}
            <div className="relative mx-4 aspect-square bg-black rounded-2xl overflow-hidden">
                {isScanning ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {/* Scan overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#E53935] rounded-tl-xl" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#E53935] rounded-tr-xl" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#E53935] rounded-bl-xl" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#E53935] rounded-br-xl" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
                        <Camera className="w-16 h-16 mb-4" />
                        <p>Cámara desactivada</p>
                    </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Result display */}
            {lastResult && (
                <div className={cn(
                    'mx-4 mt-4 p-4 rounded-xl transition-all',
                    lastResult.valid ? 'bg-green-500' : 'bg-red-500'
                )}>
                    <div className="flex items-center gap-4">
                        {lastResult.valid ? (
                            <CheckCircle className="w-12 h-12" />
                        ) : (
                            <XCircle className="w-12 h-12" />
                        )}
                        <div className="flex-1">
                            {lastResult.valid ? (
                                <>
                                    <p className="font-bold text-lg">✓ ENTRADA VÁLIDA</p>
                                    <p className="text-sm opacity-90">{lastResult.ticket?.type}</p>
                                    {lastResult.ticket?.seatRow && (
                                        <p className="text-sm opacity-90">
                                            Fila {lastResult.ticket.seatRow}, Asiento {lastResult.ticket.seatNumber}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p className="font-bold text-lg">✗ ENTRADA RECHAZADA</p>
                                    <p className="text-sm opacity-90">{lastResult.error}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Control button */}
            <div className="p-4 mt-4">
                <button
                    onClick={isScanning ? stopScanning : startScanning}
                    className={cn(
                        'w-full py-4 rounded-xl font-semibold text-lg transition-colors',
                        isScanning
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-[#E53935] hover:bg-[#B71C1C]'
                    )}
                >
                    {isScanning ? 'Detener Scanner' : 'Iniciar Scanner'}
                </button>
            </div>

            <p className="text-center text-white/40 text-sm pb-4">
                Apunta la cámara al código QR de la boleta
            </p>
        </div>
    );
}

export default function ScannerPage() {
    return <SafeTixScanner />;
}
