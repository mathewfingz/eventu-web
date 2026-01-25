'use client';

import { Heart /*, HeartOff */ } from 'lucide-react';
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
                'relative bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300',
                'hover:shadow-lg cursor-pointer',
                isActive && 'scale-105 shadow-xl z-10'
            )}
            whileHover={{ y: -4 }}
            layout
            onClick={onClick}
        >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">🎫</span>
                    </div>
                )}

                {/* Favorite button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onFavorite?.(event.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    aria-label={event.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                    <Heart
                        className={cn(
                            'w-5 h-5 transition-colors',
                            event.isFavorite ? 'fill-[#E53935] text-[#E53935]' : 'text-gray-600'
                        )}
                    />
                </button>

                {/* Status badges */}
                {event.status === 'SOLD_OUT' && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full">
                        AGOTADO
                    </div>
                )}
                {event.status === 'FEW_LEFT' && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-[#FF9800] text-white text-xs font-semibold rounded-full">
                        ÚLTIMAS BOLETAS
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-lg text-[#212121] line-clamp-1 font-[Poppins,sans-serif]">
                    {event.name}
                </h3>

                <p className="text-[#E53935] font-medium text-sm mt-1">
                    {format(eventDate, "d MMM, yyyy • HH:mm", { locale: es })}
                </p>

                <p className="text-[#757575] text-sm mt-1 line-clamp-1">
                    {event.venue.name}
                </p>

                <div className="flex items-center justify-between mt-4">
                    <span className="text-[#757575] text-sm">
                        Desde <span className="font-semibold text-[#212121]">{formatPrice(event.priceFrom)}</span>
                    </span>

                    <button
                        className="px-4 py-2 border border-[#212121] rounded-lg text-sm font-medium hover:bg-[#212121] hover:text-white transition-colors"
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
