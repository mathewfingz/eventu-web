'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventCard } from './event-card';
import { format, addDays, isSameDay } from 'date-fns';
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
    status?: 'AVAILABLE' | 'SOLD_OUT' | 'FEW_LEFT';
}

interface DateCarouselProps {
    events: Event[];
    daysToShow?: number;
    onEventClick?: (eventId: string) => void;
}

export function DateCarousel({
    events,
    daysToShow = 7,
    onEventClick
}: DateCarouselProps) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const scrollRef = useRef<HTMLDivElement>(null);

    // Generate array of dates
    const dates = Array.from({ length: daysToShow }, (_, i) => addDays(new Date(), i));

    // Filter events by selected date
    const filteredEvents = events.filter(event => {
        const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
        return isSameDay(eventDate, selectedDate);
    });

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 320;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="py-12">
            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-8 font-[Poppins,sans-serif] text-[#212121]">
                DESCUBRE EVENTOS CERCA DE TI
            </h2>

            {/* Search bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 px-4">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Busca tu evento favorito"
                        className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <Calendar className="w-5 h-5" />
                    <span>Fecha</span>
                </button>

                <button className="flex items-center gap-2 px-6 py-3 bg-[#212121] text-white rounded-lg hover:bg-gray-800 transition-colors">
                    <Search className="w-5 h-5" />
                    <span>Buscar</span>
                </button>
            </div>

            {/* Date selector - Skip style */}
            <div className="flex items-center justify-center gap-4 md:gap-8 mb-8 px-4 overflow-x-auto scrollbar-hide">
                {dates.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const eventsOnDate = events.filter(e => {
                        const eventDate = typeof e.date === 'string' ? new Date(e.date) : e.date;
                        return isSameDay(eventDate, date);
                    });

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                                'flex flex-col items-center transition-all py-2 px-4 rounded-lg min-w-[80px]',
                                isSelected
                                    ? 'bg-[#E53935]/10 opacity-100'
                                    : 'opacity-50 hover:opacity-75 hover:bg-gray-50'
                            )}
                        >
                            <span className={cn(
                                'text-sm uppercase',
                                isSelected ? 'font-bold text-[#E53935]' : 'font-medium text-[#757575]'
                            )}>
                                {format(date, 'EEE', { locale: es })}
                            </span>
                            <span className={cn(
                                'text-2xl font-bold my-1',
                                isSelected ? 'text-[#E53935]' : 'text-[#212121]'
                            )}>
                                {format(date, 'd')}
                            </span>
                            <span className={cn(
                                'text-xs uppercase',
                                isSelected ? 'font-bold text-[#E53935]' : 'font-medium text-[#757575]'
                            )}>
                                {format(date, 'MMM', { locale: es })}
                            </span>
                            {eventsOnDate.length > 0 && (
                                <span className={cn(
                                    'w-2 h-2 rounded-full mt-1',
                                    isSelected ? 'bg-[#E53935]' : 'bg-gray-400'
                                )} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Events carousel */}
            <div className="relative">
                {/* Left button */}
                {filteredEvents.length > 3 && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white shadow-lg rounded-full hover:bg-gray-50 transition-colors"
                        aria-label="Ver eventos anteriores"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                {/* Cards container */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide px-12 py-4"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    <AnimatePresence mode="popLayout">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex-shrink-0 w-[300px]"
                                    style={{ scrollSnapAlign: 'center' }}
                                >
                                    <EventCard
                                        event={event}
                                        isActive={index === Math.floor(filteredEvents.length / 2)}
                                        onClick={() => onEventClick?.(event.id)}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 w-full text-center py-12 text-[#757575]"
                            >
                                <p className="text-lg">No hay eventos para esta fecha</p>
                                <p className="text-sm mt-2">Explora otras fechas o busca tu evento favorito</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right button */}
                {filteredEvents.length > 3 && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white shadow-lg rounded-full hover:bg-gray-50 transition-colors"
                        aria-label="Ver más eventos"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
            </div>
        </section>
    );
}
