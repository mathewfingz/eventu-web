'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EventCard } from '@/components/events/event-card';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ChevronDown,
  Search,
  Music,
  PartyPopper,
  Theater,
  Laugh,
  Trophy,
  Sparkles,
  Star,
  Zap,
  ArrowRight,
  Ticket,
  Smartphone,
  Bell,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

// Mock events data
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
  { name: 'Todos', icon: Sparkles },
  { name: 'Conciertos', icon: Music },
  { name: 'Festivales', icon: PartyPopper },
  { name: 'Teatro', icon: Theater },
  { name: 'Comedia', icon: Laugh },
  { name: 'Deportes', icon: Trophy },
  { name: 'Fiestas', icon: Star },
];

const heroBanners = [
  {
    id: '1',
    name: 'BAD BUNNY',
    subtitle: 'World Tour 2026',
    likes: '15.2k',
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=500&fit=crop',
    tag: 'Destacado',
  },
  {
    id: '2',
    name: 'KAROL G',
    subtitle: 'Mañana Será Bonito',
    likes: '12.8k',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&h=500&fit=crop',
    tag: 'Trending',
  },
  {
    id: '3',
    name: 'SHAKIRA',
    subtitle: 'Las Mujeres Ya No Lloran',
    likes: '20.1k',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=500&fit=crop',
    tag: 'Imperdible',
  },
];

// Stats for social proof
const stats = [
  { value: '2M+', label: 'Boletas vendidas' },
  { value: '500+', label: 'Eventos' },
  { value: '50+', label: 'Ciudades' },
  { value: '99.9%', label: 'Satisfacción' },
];

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [heroBannerIndex, setHeroBannerIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

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

  // Auto-advance hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroBannerIndex((prev) => (prev === heroBanners.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const carouselSwipe = useSwipe(handleNext, handlePrev);
  const heroSwipe = useSwipe(handleHeroNext, handleHeroPrev);

  const getVisibleEvents = () => {
    const prevIndex = activeIndex === 0 ? mockEvents.length - 1 : activeIndex - 1;
    const nextIndex = activeIndex === mockEvents.length - 1 ? 0 : activeIndex + 1;
    return [
      { ...mockEvents[prevIndex], position: 'left' as const },
      { ...mockEvents[activeIndex], position: 'center' as const },
      { ...mockEvents[nextIndex], position: 'right' as const },
    ];
  };

  const currentBanner = heroBanners[heroBannerIndex];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Header />

      <main className="flex-1">
        {/* Hero Banner with Search Overlay */}
        <section className="relative">
          {/* Search Bar - Floating over hero */}
          <div className="relative z-20 px-4 sm:px-6 lg:px-8 pt-6 pb-2">
            <motion.div
              className="max-w-3xl mx-auto"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className={`w-5 h-5 transition-colors ${searchFocused ? 'text-[#E53935]' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Buscar conciertos, artistas, eventos..."
                  className="w-full pl-14 pr-6 py-4 sm:py-5 bg-white border border-gray-200/80 rounded-2xl text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]/40 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all placeholder:text-gray-400"
                />
              </div>
            </motion.div>
          </div>

          {/* Hero Banner */}
          <div className="px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-4 sm:pb-6">
            <div className="max-w-6xl mx-auto">
              <div
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.12)] touch-pan-y group"
                onTouchStart={heroSwipe.onTouchStart}
                onTouchMove={heroSwipe.onTouchMove}
                onTouchEnd={heroSwipe.onTouchEnd}
              >
                {/* Image with animated transition */}
                <div className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentBanner.id}
                      src={currentBanner.imageUrl}
                      alt={currentBanner.name}
                      className="w-full h-full object-cover absolute inset-0"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </AnimatePresence>

                  {/* Multi-layer gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentBanner.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Tag badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-white/90 text-xs font-medium mb-3 border border-white/20">
                          <Zap className="w-3 h-3" />
                          {currentBanner.tag}
                        </div>

                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-1 sm:mb-2">
                          {currentBanner.name}
                        </h1>
                        <p className="text-white/80 text-sm sm:text-xl md:text-2xl font-light mb-4 sm:mb-6 tracking-wide">
                          {currentBanner.subtitle}
                        </p>

                        <div className="flex items-center gap-3 sm:gap-4">
                          <Link
                            href={`/events/${currentBanner.id}`}
                            className="px-6 sm:px-8 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#E53935] to-[#FF6B6B] text-white rounded-xl font-semibold text-sm sm:text-base transition-all hover:shadow-[0_4px_20px_rgba(229,57,53,0.4)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                          >
                            <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
                            Ver boletos
                          </Link>
                          <button className="px-5 sm:px-7 py-2.5 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm sm:text-base transition-all backdrop-blur-sm border border-white/25">
                            Saber más
                          </button>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Carousel dots */}
                    <div className="flex gap-2 mt-5 sm:mt-8">
                      {heroBanners.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setHeroBannerIndex(idx)}
                          className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${idx === heroBannerIndex
                            ? 'bg-white w-8 sm:w-10'
                            : 'bg-white/30 hover:bg-white/50 w-1.5 sm:w-2'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Likes badge */}
                  <div className="absolute top-3 right-3 sm:top-5 sm:right-5 flex items-center gap-1.5 bg-black/30 backdrop-blur-xl px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6B6B] fill-[#FF6B6B]" />
                    <span className="text-white text-xs sm:text-sm font-medium">{currentBanner.likes}</span>
                  </div>

                  {/* Navigation arrows - visible on hover */}
                  <button
                    onClick={handleHeroPrev}
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/25 transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                  <button
                    onClick={handleHeroNext}
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/25 transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Pills with Icons */}
        <section className="px-3 sm:px-6 lg:px-8 pb-6 sm:pb-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {/* Location selector */}
              <button className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-[#E53935] to-[#FF6B6B] text-white rounded-xl text-xs sm:text-sm font-semibold hover:shadow-[0_4px_16px_rgba(229,57,53,0.3)] transition-all">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Bogotá
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70" />
              </button>

              <div className="hidden sm:block h-7 w-px bg-gray-200 flex-shrink-0" />

              {/* Category pills with icons */}
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.name;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${isSelected
                      ? 'bg-[#1D1D1F] text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                      : 'bg-white text-[#1D1D1F] border border-gray-200 hover:border-gray-400 hover:shadow-sm'
                      }`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-white' : 'text-[#86868B]'}`} />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Social Proof Stats */}
        <section className="px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="text-center py-5 sm:py-6 px-4 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                >
                  <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#E53935] to-[#FF6B6B] bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-[#86868B] mt-1 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Center-Focus Carousel */}
        <section className="py-6 sm:py-10 px-0 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-6 sm:mb-10 px-4"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#E53935] uppercase tracking-widest mb-2">
                <MapPin className="w-3.5 h-3.5" />
                Cerca de ti
              </span>
              <h2 className="text-xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
                Descubre eventos increíbles
              </h2>
            </motion.div>

            {/* Carousel */}
            <div
              className="relative touch-pan-y"
              onTouchStart={carouselSwipe.onTouchStart}
              onTouchMove={carouselSwipe.onTouchMove}
              onTouchEnd={carouselSwipe.onTouchEnd}
            >
              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex items-center justify-center hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] hover:scale-105 transition-all hidden sm:flex"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#1D1D1F]" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex items-center justify-center hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] hover:scale-105 transition-all hidden sm:flex"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#1D1D1F]" />
              </button>

              {/* Cards */}
              <div className="flex items-stretch justify-center select-none">
                {getVisibleEvents().map((event, index) => (
                  <CarouselCard
                    key={`${event.id}-${index}`}
                    event={event}
                    isCenter={event.position === 'center'}
                    position={event.position}
                  />
                ))}
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-1.5 mt-5 sm:mt-6">
                {mockEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-400 ${idx === activeIndex
                      ? 'bg-[#E53935] w-6 sm:w-8'
                      : 'bg-gray-300 hover:bg-gray-400 w-1.5 sm:w-2'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <motion.div
            className="flex items-end justify-between mb-8"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div>
              <span className="text-xs sm:text-sm font-semibold text-[#E53935] uppercase tracking-widest mb-1 block">
                No te los pierdas
              </span>
              <h2 className="text-xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
                Próximos eventos
              </h2>
            </div>
            <Link
              href="/events"
              className="flex items-center gap-1.5 text-[#E53935] hover:text-[#B71C1C] font-semibold text-sm group transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {mockEvents.slice(0, 4).map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Presale Banner */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-[#1D1D1F] via-[#2C2C2E] to-[#3A3A3C] rounded-3xl p-7 sm:p-10 text-white overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#E53935]/20 to-transparent rounded-full -translate-y-1/3 translate-x-1/4 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#FF6B6B]/15 to-transparent rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E53935]/5 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E53935]/20 rounded-full mb-4 border border-[#E53935]/30">
                  <Zap className="w-3.5 h-3.5 text-[#FF6B6B]" />
                  <span className="text-[#FF6B6B] text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    Preventa Exclusiva
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
                  SHAKIRA - LAS MUJERES<br className="hidden sm:block" /> YA NO LLORAN
                </h3>
                <p className="text-white/60 text-sm sm:text-base max-w-md">
                  15% de descuento con código{' '}
                  <span className="font-mono bg-white/10 text-white px-2.5 py-1 rounded-lg border border-white/10 text-sm">
                    FANS2026
                  </span>
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button className="px-8 sm:px-10 py-4 bg-gradient-to-r from-[#E53935] to-[#FF6B6B] text-white rounded-2xl font-semibold hover:shadow-[0_8px_30px_rgba(229,57,53,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-base whitespace-nowrap flex items-center gap-2">
                  <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
                  Acceder a Preventa
                </button>
                <span className="text-white/40 text-xs">Cupos limitados</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* App Download & Newsletter */}
        <section className="py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* App Download */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#E53935]/10 to-[#FF6B6B]/10 rounded-2xl flex items-center justify-center mb-5">
                  <Smartphone className="w-6 h-6 text-[#E53935]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-[#1D1D1F] tracking-tight">
                  Descarga la app
                </h2>
                <p className="text-[#86868B] mb-6 text-sm sm:text-base leading-relaxed">
                  Accede a tus boletas, pide comida desde tu asiento y colecciona recuerdos digitales.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="px-5 py-3 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-[#2C2C2E] transition-colors text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    App Store
                  </button>
                  <button className="px-5 py-3 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-[#2C2C2E] transition-colors text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 01-.609-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.627L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.991l-2.302 2.302L5.864 2.658z"/>
                    </svg>
                    Google Play
                  </button>
                </div>
              </motion.div>

              {/* Newsletter */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#E53935]/10 to-[#FF6B6B]/10 rounded-2xl flex items-center justify-center mb-5">
                  <Bell className="w-6 h-6 text-[#E53935]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-[#1D1D1F] tracking-tight">
                  No te pierdas nada
                </h2>
                <p className="text-[#86868B] mb-6 text-sm sm:text-base leading-relaxed">
                  Recibe alertas de preventas exclusivas y ofertas especiales directamente en tu correo.
                </p>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E53935]/15 focus:border-[#E53935]/40 text-sm transition-all"
                  />
                  <button
                    type="submit"
                    className="px-5 sm:px-6 py-3 bg-gradient-to-r from-[#E53935] to-[#FF6B6B] text-white rounded-xl font-semibold hover:shadow-[0_4px_16px_rgba(229,57,53,0.3)] transition-all text-sm whitespace-nowrap"
                  >
                    Suscribirme
                  </button>
                </form>
              </motion.div>
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
  event: typeof mockEvents[0] & { position: 'left' | 'center' | 'right' };
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

  const sizeClasses = isCenter
    ? 'w-[180px] sm:w-[340px] md:w-[380px] flex-shrink-0 mx-1 sm:mx-4 scale-100 opacity-100 z-10'
    : 'w-[90px] sm:w-[220px] md:w-[280px] flex-shrink-0 mx-0.5 sm:mx-3 scale-100 sm:scale-[0.92] opacity-50 sm:opacity-60 z-0 self-start';

  return (
    <Link
      href={`/events/${event.id}`}
      className={`block rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 ease-out ${sizeClasses} ${isCenter
        ? 'bg-white shadow-[0_8px_30px_rgba(0,0,0,0.1)] ring-1 ring-black/5'
        : 'bg-transparent sm:bg-white shadow-none sm:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
        }`}
    >
      {/* Image */}
      <div className={`relative aspect-square ${!isCenter ? 'rounded-2xl overflow-hidden sm:rounded-none' : ''}`}>
        <img
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all ${isCenter ? 'block' : 'hidden sm:flex'}`}
        >
          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#86868B]" />
        </button>

        {/* Status Badge */}
        {isCenter && event.status === 'FEW_LEFT' && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-orange-500 text-white text-[10px] sm:text-xs font-semibold rounded-lg">
            Últimas
          </div>
        )}
        {isCenter && event.status === 'SOLD_OUT' && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-900 text-white text-[10px] sm:text-xs font-semibold rounded-lg">
            Agotado
          </div>
        )}

        {/* Mobile side cards: overlay */}
        {!isCenter && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent sm:hidden flex items-end p-2">
            <p className="text-white text-[8px] font-semibold line-clamp-2 leading-tight drop-shadow-md">{event.name}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-3 sm:p-4 bg-white ${!isCenter ? 'hidden sm:block' : ''}`}>
        <h3 className={`font-semibold text-[#1D1D1F] mb-0.5 sm:mb-1 line-clamp-1 ${isCenter ? 'text-sm sm:text-lg' : 'text-sm'}`}>
          {event.name}
        </h3>
        <p className={`text-[#E53935] mb-2.5 sm:mb-3 font-medium ${isCenter ? 'text-xs sm:text-sm' : 'text-xs'}`}>
          {formatDate(event.date)}, {formatTime(event.date)}
        </p>

        {isCenter && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-full bg-gradient-to-r from-[#E53935] to-[#FF6B6B] text-white font-semibold rounded-xl hover:shadow-[0_4px_16px_rgba(229,57,53,0.3)] transition-all py-2.5 sm:py-3 text-xs sm:text-sm"
          >
            Comprar
          </button>
        )}

        {!isCenter && (
          <div className="hidden sm:flex items-center justify-between mt-2">
            <span className="text-[#86868B] text-xs font-medium">
              ${(event.priceFrom / 1000).toFixed(0)}K
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="border border-[#1D1D1F] text-[#1D1D1F] font-medium rounded-lg hover:bg-[#1D1D1F] hover:text-white transition-colors px-3 py-1.5 text-xs"
            >
              Comprar
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
