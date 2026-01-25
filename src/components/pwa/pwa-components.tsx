'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Share2, Plus, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useInstallPrompt, useServiceWorker, useOnlineStatus } from '@/lib/pwa/hooks';
import { cn } from '@/lib/utils';

/**
 * Install Prompt Banner
 * Shows a smart install prompt at the right time
 */
export function InstallBanner() {
    const { isInstallable, isInstalled, platform, promptInstall } = useInstallPrompt();
    const [dismissed, setDismissed] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    // Don't show if already installed or dismissed
    if (isInstalled || dismissed) return null;
    if (!isInstallable) return null;

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-pb"
                >
                    <div className="max-w-lg mx-auto bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-2xl p-4 shadow-2xl border border-[#E53935]/20">
                        <div className="flex items-start gap-4">
                            {/* App Icon */}
                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#E53935] flex items-center justify-center">
                                <Smartphone className="w-7 h-7 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold text-lg">
                                    Instala Eventu
                                </h3>
                                <p className="text-white/70 text-sm mt-1">
                                    Accede a tus boletas sin conexión y recibe notificaciones de tus eventos favoritos.
                                </p>

                                {/* Actions */}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={async () => {
                                            if (platform === 'ios') {
                                                setShowInstructions(true);
                                            } else {
                                                const success = await promptInstall();
                                                if (!success) setDismissed(true);
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-lg font-medium text-sm hover:bg-[#B71C1C] transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Instalar
                                    </button>
                                    <button
                                        onClick={() => setDismissed(true)}
                                        className="px-4 py-2 text-white/60 hover:text-white text-sm transition-colors"
                                    >
                                        Ahora no
                                    </button>
                                </div>
                            </div>

                            {/* Close */}
                            <button
                                onClick={() => setDismissed(true)}
                                className="flex-shrink-0 p-1 text-white/40 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* iOS Instructions Modal */}
            <AnimatePresence>
                {showInstructions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50"
                        onClick={() => setShowInstructions(false)}
                    >
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="w-full max-w-md bg-white rounded-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-[#212121] mb-4">
                                    Instalar en iPhone/iPad
                                </h3>

                                <div className="space-y-4">
                                    <Step
                                        number={1}
                                        text="Toca el botón Compartir"
                                        icon={<Share2 className="w-5 h-5" />}
                                    />
                                    <Step
                                        number={2}
                                        text="Desplázate y toca 'Agregar a pantalla de inicio'"
                                        icon={<Plus className="w-5 h-5" />}
                                    />
                                    <Step
                                        number={3}
                                        text="Toca 'Agregar' para confirmar"
                                    />
                                </div>

                                <button
                                    onClick={() => setShowInstructions(false)}
                                    className="w-full mt-6 py-3 bg-[#E53935] text-white rounded-xl font-medium"
                                >
                                    Entendido
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function Step({
    number,
    text,
    icon,
}: {
    number: number;
    text: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E53935] text-white flex items-center justify-center font-bold text-sm">
                {number}
            </div>
            <div className="flex-1 flex items-center gap-2 text-[#212121]">
                {icon && <span className="text-[#E53935]">{icon}</span>}
                {text}
            </div>
        </div>
    );
}

/**
 * Update Available Banner
 * Shows when new version is available
 */
export function UpdateBanner() {
    const { updateAvailable, applyUpdate } = useServiceWorker();

    if (!updateAvailable) return null;

    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-50 p-4 safe-area-pt"
        >
            <div className="max-w-lg mx-auto bg-blue-600 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">
                            Nueva versión disponible
                        </span>
                    </div>
                    <button
                        onClick={applyUpdate}
                        className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
                    >
                        Actualizar
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Offline Indicator
 * Shows when user is offline
 */
export function OfflineIndicator() {
    const isOnline = useOnlineStatus();
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setWasOffline(true);
        }
    }, [isOnline]);

    // Show "back online" message briefly
    useEffect(() => {
        if (isOnline && wasOffline) {
            const timer = setTimeout(() => setWasOffline(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline]);

    if (isOnline && !wasOffline) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className={cn(
                    'fixed top-4 left-4 right-4 z-50 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm safe-area-pt',
                    isOnline
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-yellow-900'
                )}
            >
                {isOnline ? (
                    <>
                        <Wifi className="w-4 h-4" />
                        Conexión restaurada
                    </>
                ) : (
                    <>
                        <WifiOff className="w-4 h-4" />
                        Sin conexión - Modo offline
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * PWA Provider
 * Wraps app with PWA components
 */
export function PWAProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <InstallBanner />
            <UpdateBanner />
            <OfflineIndicator />
        </>
    );
}
