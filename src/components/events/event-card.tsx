'use client';

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Event {
    id: string;
    name: string;
    date: Date | string;
    venue: {
        name: string;
    };
    imageUrl?: string;
    priceFrom: number;
    isFavorite?: boolean;
    status?: 'AVAILABLE' | 'SOLD_OUT' | 'FEW_LEFT' | 'COMING_SOON';
}

interface EventCardProps {
    event: Event;
    isActive?: boolean;
    onFavorite?: (id: string) => void;
    onClick?: () => void;
}

export function EventCard({
    event,
    isActive = false,
    onFavorite,
    onClick
}: EventCardProps) {
    const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;

    return (
        <motion.div
            className={cn(
                'relative bg-white rounded-2xl overflow-hidden transition-all duration-300',
                'shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)]',
                'cursor-pointer border border-gray-100/80',
                isActive && 'scale-105 shadow-xl z-10'
            )}
            whileHover={{ y: -6 }}
            layout
            onClick={onClick}
        >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    </div>
                )}

                {/* Favorite button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onFavorite?.(event.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/85 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                    aria-label={event.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                    <Heart
                        className={cn(
                            'w-4 h-4 transition-colors',
                            event.isFavorite ? 'fill-[#E53935] text-[#E53935]' : 'text-[#86868B]'
                        )}
                    />
                </button>

                {/* Status badges */}
                {event.status === 'SOLD_OUT' && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-[11px] font-semibold rounded-lg">
                        AGOTADO
                    </div>
                )}
                {event.status === 'FEW_LEFT' && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-[11px] font-semibold rounded-lg">
                        ÚLTIMAS BOLETAS
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-base text-[#1D1D1F] line-clamp-1 tracking-tight">
                    {event.name}
                </h3>

                <p className="text-[#E53935] font-medium text-sm mt-1.5">
                    {format(eventDate, "d MMM, yyyy \u2022 HH:mm", { locale: es })}
                </p>

                <p className="text-[#86868B] text-sm mt-1 line-clamp-1">
                    {event.venue.name}
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-[#86868B] text-sm">
                        Desde <span className="font-semibold text-[#1D1D1F]">{formatPrice(event.priceFrom)}</span>
                    </span>

                    <button
                        className="px-4 py-2 bg-[#1D1D1F] text-white rounded-lg text-sm font-medium hover:bg-[#2C2C2E] transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.();
                        }}
                    >
                        Comprar
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
