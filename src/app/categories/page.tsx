'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { mockCategories, mockEvents } from '@/lib/mock-data';
import { ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  // Count events per category
  const categoriesWithCount = mockCategories.map((category) => ({
    ...category,
    eventCount: mockEvents.filter((e) => e.category === category.name).length,
  }));

  // Featured categories (those with most events)
  const featuredCategories = [...categoriesWithCount]
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#212121] to-[#424242] py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-[Poppins,sans-serif] mb-4">
              Explora por Categoría
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Descubre eventos de todas las categorías: conciertos, festivales, teatro,
              deportes y mucho más
            </p>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 font-[Poppins,sans-serif]">
            Categorías destacadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`/events?category=${encodeURIComponent(category.name)}`}
                className="group relative h-64 rounded-2xl overflow-hidden"
              >
                {/* Background gradient based on index */}
                <div
                  className={`absolute inset-0 ${
                    index === 0
                      ? 'bg-gradient-to-br from-[#E53935] to-[#B71C1C]'
                      : index === 1
                      ? 'bg-gradient-to-br from-purple-600 to-purple-900'
                      : 'bg-gradient-to-br from-blue-600 to-blue-900'
                  }`}
                />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span className="text-6xl mb-4">{category.icon}</span>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {category.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">
                      {category.eventCount} eventos
                    </span>
                    <span className="flex items-center gap-1 text-white font-medium group-hover:gap-2 transition-all">
                      Explorar
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All Categories Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 font-[Poppins,sans-serif]">
            Todas las categorías
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categoriesWithCount.map((category) => (
              <Link
                key={category.id}
                href={`/events?category=${encodeURIComponent(category.name)}`}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-center"
              >
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </span>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.eventCount} eventos</p>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#E53935] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4 font-[Poppins,sans-serif]">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-white/80 mb-6">
              Explora todos los eventos disponibles o usa la búsqueda para encontrar
              exactamente lo que necesitas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/events"
                className="px-8 py-3 bg-white text-[#E53935] rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Ver todos los eventos
              </Link>
              <Link
                href="/"
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
