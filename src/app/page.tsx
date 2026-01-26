'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EventCard } from '@/components/events/event-card';
import {
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// Custom hook for touch swipe
function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onSwipeLeft();
    } else if (isRightSwipe) {
      onSwipeRight();
    }
  }, [onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}

// Mock events data - will be replaced with real data from Supabase
const mockEvents = [
  {
    id: '1',
    name: 'Bad Bunny - World Tour 2026',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    venue: { name: 'Estadio El Campín, Bogotá' },
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop',
    priceFrom: 250000,
    status: 'AVAILABLE' as const,
  },
  {
    id: '2',
    name: 'Karol G - Mañana Será Bonito',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    venue: { name: 'Movistar Arena, Bogotá' },
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=400&fit=crop',
    priceFrom: 180000,
    status: 'FEW_LEFT' as const,
  },
  {
    id: '3',
    name: 'Feid - MOR Tour',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    venue: { name: 'Coliseo Live, Bogotá' },
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop',
    priceFrom: 150000,
    status: 'AVAILABLE' as const,
  },
  {
    id: '4',
    name: 'Morat - Si Ayer Fuera Hoy',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    venue: { name: 'Teatro Metropolitano, Medellín' },
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
    priceFrom: 120000,
    status: 'AVAILABLE' as const,
  },
  {
    id: '5',
    name: 'Shakira - Las Mujeres Ya No Lloran',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    venue: { name: 'Estadio Atanasio Girardot' },
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop',
    priceFrom: 300000,
    status: 'SOLD_OUT' as const,
  },
  {
    id: '6',
    name: 'J Balvin - Colores Tour',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    venue: { name: 'Arena del Río, Barranquilla' },
    imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop',
    priceFrom: 200000,
    status: 'AVAILABLE' as const,
  },
];

const categories = [
  { name: 'Todos', active: true },
  { name: 'Conciertos', active: false },
  { name: 'Festivales', active: false },
  { name: 'Teatro', active: false },
  { name: 'Comedia', active: false },
  { name: 'Deportes', active: false },
  { name: 'Fiestas', active: false },
];

// Hero banner data for sliding
const heroBanners = [
  {
    id: '1',
    name: 'BAD BUNNY',
    subtitle: 'World Tour 2026',
    likes: '15.2k',
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=500&fit=crop',
  },
  {
    id: '2',
    name: 'KAROL G',
    subtitle: 'Mañana Será Bonito',
    likes: '12.8k',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&h=500&fit=crop',
  },
  {
    id: '3',
    name: 'SHAKIRA',
    subtitle: 'Las Mujeres Ya No Lloran',
    likes: '20.1k',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=500&fit=crop',
  },
];

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [heroBannerIndex, setHeroBannerIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? mockEvents.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === mockEvents.length - 1 ? 0 : prev + 1));
  }, []);

  const handleHeroPrev = useCallback(() => {
    setHeroBannerIndex((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1));
  }, []);

  const handleHeroNext = useCallback(() => {
    setHeroBannerIndex((prev) => (prev === heroBanners.length - 1 ? 0 : prev + 1));
  }, []);

  // Touch swipe handlers
  const carouselSwipe = useSwipe(handleNext, handlePrev);
  const heroSwipe = useSwipe(handleHeroNext, handleHeroPrev);

  // Get visible events (prev, current, next)
  const getVisibleEvents = () => {
    const prevIndex = activeIndex === 0 ? mockEvents.length - 1 : activeIndex - 1;
    const nextIndex = activeIndex === mockEvents.length - 1 ? 0 : activeIndex + 1;
    return [
      { ...mockEvents[prevIndex], position: 'left' },
      { ...mockEvents[activeIndex], position: 'center' },
      { ...mockEvents[nextIndex], position: 'right' },
    ];
  };

  const currentBanner = heroBanners[heroBannerIndex];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />

      <main className="flex-1">
        {/* Large Search Bar */}
        <section className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conciertos, artistas, eventos y más..."
                className="w-full pl-14 pr-6 py-5 bg-white border border-gray-200 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/30 focus:border-[#E53935] shadow-sm hover:shadow-md transition-shadow"
              />
            </div>
          </div>
        </section>

        {/* Hero Banner - Full Width Image */}
        <section className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <div className="max-w-6xl mx-auto">
            <div
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl touch-pan-y"
              onTouchStart={heroSwipe.onTouchStart}
              onTouchMove={heroSwipe.onTouchMove}
              onTouchEnd={heroSwipe.onTouchEnd}
            >
              {/* Full width image - taller on mobile */}
              <div className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] relative">
                <img
                  src={currentBanner.imageUrl}
                  alt={currentBanner.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Text content - bottom left */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-12">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white font-[Poppins,sans-serif] mb-1 sm:mb-2 drop-shadow-lg">
                    {currentBanner.name}
                  </h1>
                  <p className="text-white/90 text-sm sm:text-xl md:text-2xl mb-3 sm:mb-6 drop-shadow-md">
                    {currentBanner.subtitle}
                  </p>

                  <button className="px-5 sm:px-8 py-2.5 sm:py-3.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium text-sm sm:text-base transition-colors backdrop-blur-sm border border-white/40">
                    Ver boletos
                  </button>

                  {/* Carousel dots */}
                  <div className="flex gap-2 mt-4 sm:mt-6">
                    {heroBanners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setHeroBannerIndex(idx)}
                        className={`h-2 sm:h-2.5 rounded-full transition-all ${idx === heroBannerIndex
                          ? 'bg-white w-6 sm:w-8'
                          : 'bg-white/40 hover:bg-white/60 w-2 sm:w-2.5'
                          }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Likes badge - top right */}
                <div className="absolute top-3 right-3 sm:top-6 sm:right-6 flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-md px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full">
                  <span className="text-white text-xs sm:text-sm font-medium">{currentBanner.likes}</span>
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Pills - Horizontal Scroll on Mobile */}
        <section className="px-3 sm:px-6 lg:px-8 pb-4 sm:pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {/* Location selector */}
              <button className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#E53935] text-white rounded-full text-xs sm:text-sm font-medium hover:bg-[#B71C1C] transition-colors">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Bogotá
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Divider - hidden on mobile */}
              <div className="hidden sm:block h-6 w-px bg-gray-300 flex-shrink-0" />

              {/* Category pills */}
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex-shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === category.name
                    ? 'bg-[#212121] text-white'
                    : 'bg-white text-[#212121] border border-gray-300 hover:border-[#212121]'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Center-Focus Carousel */}
        <section className="py-6 sm:py-8 px-0 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 sm:mb-10 px-4">
              <h2 className="text-lg sm:text-2xl font-bold text-[#212121] font-[Poppins,sans-serif]">
                DESCUBRE EVENTOS CERCA DE TI
              </h2>
            </div>

            {/* Carousel with Center Focus */}
            <div
              className="relative touch-pan-y"
              onTouchStart={carouselSwipe.onTouchStart}
              onTouchMove={carouselSwipe.onTouchMove}
              onTouchEnd={carouselSwipe.onTouchEnd}
            >
              {/* Navigation Arrows - Floating over cards, hidden on mobile */}
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 bg-white/95 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors hidden sm:flex"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#212121]" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 bg-white/95 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors hidden sm:flex"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#212121]" />
              </button>

              {/* Cards Container - Side cards overflow beyond screen edges */}
              <div className="flex items-stretch justify-center select-none">
                {getVisibleEvents().map((event, index) => (
                  <CarouselCard
                    key={`${event.id}-${index}`}
                    event={event}
                    isCenter={event.position === 'center'}
                    position={event.position as 'left' | 'center' | 'right'}
                  />
                ))}
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center gap-1.5 mt-4">
                {mockEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2 rounded-full transition-all ${idx === activeIndex
                      ? 'bg-[#E53935] w-6'
                      : 'bg-gray-300 hover:bg-gray-400 w-2'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#212121] font-[Poppins,sans-serif]">
              EVENTOS
            </h2>
            <Link
              href="/events"
              className="text-[#E53935] hover:text-[#B71C1C] font-medium"
            >
              VER TODOS
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockEvents.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* Presale Banner */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-[#E53935] to-[#B71C1C] rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔥</span>
                  <span className="font-semibold uppercase tracking-wider">
                    Preventa Exclusiva
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2 font-[Poppins,sans-serif]">
                  SHAKIRA - LAS MUJERES YA NO LLORAN
                </h3>
                <p className="opacity-90">
                  15% de descuento con código <span className="font-mono bg-white/20 px-2 py-1 rounded">FANS2026</span>
                </p>
              </div>

              <button className="px-8 py-4 bg-white text-[#E53935] rounded-full font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap">
                Acceder a Preventa
              </button>
            </div>
          </div>
        </section>

        {/* App Download & Newsletter */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              {/* App Download */}
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold mb-4 text-[#212121] font-[Poppins,sans-serif]">
                  📱 DESCARGA LA APP
                </h2>
                <p className="text-[#757575] mb-6">
                  Accede a tus boletas, pide comida desde tu asiento y colecciona recuerdos digitales.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <button className="px-6 py-3 bg-[#212121] text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    App Store
                  </button>
                  <button className="px-6 py-3 bg-[#212121] text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Google Play
                  </button>
                </div>
              </div>

              {/* Newsletter */}
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold mb-4 text-[#212121] font-[Poppins,sans-serif]">
                  📧 SUSCRÍBETE Y NO TE PIERDAS NADA
                </h2>
                <p className="text-[#757575] mb-6">
                  Recibe alertas de preventas exclusivas y ofertas especiales.
                </p>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
                  >
                    Suscribirme
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}

// Carousel Card with center focus effect
function CarouselCard({
  event,
  isCenter,
}: {
  event: typeof mockEvents[0];
  isCenter: boolean;
  position: 'left' | 'center' | 'right';
}) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Mobile: center card larger, side cards show only square image (no content area)
  // Desktop: all visible with normal spacing
  const sizeClasses = isCenter
    ? 'w-[180px] sm:w-[340px] md:w-[380px] flex-shrink-0 mx-1 sm:mx-4 scale-100 opacity-100 z-10'
    : 'w-[90px] sm:w-[220px] md:w-[280px] flex-shrink-0 mx-0.5 sm:mx-3 scale-100 sm:scale-90 opacity-50 sm:opacity-60 z-0 self-start';

  // On mobile, side cards don't have white background - just the rounded image
  const bgClasses = isCenter
    ? 'bg-white shadow-lg'
    : 'bg-transparent sm:bg-white shadow-lg sm:shadow-lg';

  return (
    <Link
      href={`/events/${event.id}`}
      className={`block rounded-lg sm:rounded-2xl overflow-hidden transition-all duration-500 ease-out ${sizeClasses} ${bgClasses} ${isCenter ? 'ring-2 ring-[#E53935]/20' : ''}`}
    >
      {/* Image - Square */}
      <div className={`relative aspect-square ${!isCenter ? 'rounded-lg overflow-hidden sm:rounded-none' : ''}`}>
        <img
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        {/* Favorite Button - Only on center and desktop */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors ${isCenter ? 'block' : 'hidden sm:flex'}`}
        >
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-[#757575]" />
        </button>

        {/* Status Badge - Only on center */}
        {isCenter && event.status === 'FEW_LEFT' && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-500 text-white text-[10px] sm:text-xs font-medium rounded">
            Últimas
          </div>
        )}
        {isCenter && event.status === 'SOLD_OUT' && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-800 text-white text-[10px] sm:text-xs font-medium rounded">
            Agotado
          </div>
        )}

        {/* Mobile side cards: overlay with name only */}
        {!isCenter && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent sm:hidden flex items-end p-1.5">
            <p className="text-white text-[7px] font-semibold line-clamp-2 leading-tight drop-shadow-md">{event.name}</p>
          </div>
        )}
      </div>

      {/* Content - Only for center on mobile, all on desktop */}
      {(isCenter || !isCenter) && (
        <div className={`p-2 sm:p-4 bg-white ${!isCenter ? 'hidden sm:block' : ''}`}>
          <h3 className={`font-semibold text-[#212121] mb-0.5 sm:mb-1 line-clamp-1 ${isCenter ? 'text-sm sm:text-lg' : 'text-sm'}`}>
            {event.name}
          </h3>
          <p className={`text-[#E53935] mb-2 sm:mb-3 ${isCenter ? 'text-xs sm:text-sm' : 'text-xs'}`}>
            {formatDate(event.date)}, {formatTime(event.date)}
          </p>

          {/* Buy button - Only for center on mobile */}
          {isCenter && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-full bg-[#E53935] text-white font-medium rounded-lg hover:bg-[#B71C1C] transition-colors py-2 sm:py-2.5 text-xs sm:text-sm"
            >
              Comprar
            </button>
          )}

          {/* Desktop side cards: show price and button */}
          {!isCenter && (
            <div className="hidden sm:flex items-center justify-between mt-2">
              <span className="text-[#757575] text-xs">
                ${(event.priceFrom / 1000).toFixed(0)}K
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="border border-[#212121] text-[#212121] font-medium rounded-lg hover:bg-[#212121] hover:text-white transition-colors px-3 py-1.5 text-xs"
              >
                Comprar
              </button>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
