'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EventCard } from '@/components/events/event-card';
import { mockEvents, mockCategories, mockCities } from '@/lib/mock-data';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Calendar,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar y ordenar eventos
  const filteredEvents = useMemo(() => {
    let events = [...mockEvents];

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      events = events.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.venue.name.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query)
      );
    }

    // Filtrar por categoría
    if (selectedCategory) {
      events = events.filter((event) => event.category === selectedCategory);
    }

    // Filtrar por ciudad
    if (selectedCity) {
      events = events.filter((event) => event.venue.city === selectedCity);
    }

    // Ordenar
    events.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price':
          return a.priceFrom - b.priceFrom;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return events;
  }, [searchQuery, selectedCategory, selectedCity, sortBy]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedCity(null);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || selectedCity || searchQuery;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#E53935] to-[#B71C1C] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-[Poppins,sans-serif] mb-4">
              Descubre Eventos Increíbles
            </h1>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Encuentra los mejores conciertos, festivales, teatro y más en tu ciudad
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar eventos, artistas, lugares..."
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 min-w-max">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-[#212121] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {mockCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category.name
                      ? 'bg-[#212121] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">Filtros</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-[#E53935] rounded-full" />
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {filteredEvents.length} eventos encontrados
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'name')}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
              >
                <option value="date">Ordenar por fecha</option>
                <option value="price">Ordenar por precio</option>
                <option value="name">Ordenar por nombre</option>
              </select>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="bg-white rounded-xl p-6 shadow-sm mb-8 border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Ciudad
                  </label>
                  <select
                    value={selectedCity || ''}
                    onChange={(e) => setSelectedCity(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                  >
                    <option value="">Todas las ciudades</option>
                    {mockCities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name} ({city.eventCount})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Categoría
                  </label>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                  >
                    <option value="">Todas las categorías</option>
                    {mockCategories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategory && (
                <span className="flex items-center gap-1 px-3 py-1 bg-[#E53935]/10 text-[#E53935] rounded-full text-sm">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory(null)}>
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {selectedCity && (
                <span className="flex items-center gap-1 px-3 py-1 bg-[#E53935]/10 text-[#E53935] rounded-full text-sm">
                  {selectedCity}
                  <button onClick={() => setSelectedCity(null)}>
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="flex items-center gap-1 px-3 py-1 bg-[#E53935]/10 text-[#E53935] rounded-full text-sm">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <EventCard
                    event={{
                      id: event.id,
                      name: event.name,
                      date: event.date,
                      venue: event.venue,
                      imageUrl: event.imageUrl,
                      priceFrom: event.priceFrom,
                      status: event.status,
                    }}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No encontramos eventos
              </h3>
              <p className="text-gray-500 mb-6">
                Intenta ajustar tus filtros o buscar algo diferente
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
              >
                Ver todos los eventos
              </button>
            </div>
          )}
        </section>

        {/* Newsletter CTA */}
        <section className="bg-[#212121] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4 font-[Poppins,sans-serif]">
              No te pierdas ningún evento
            </h2>
            <p className="text-gray-400 mb-6">
              Suscríbete y recibe alertas de nuevos eventos y preventas exclusivas
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
              >
                Suscribirme
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
