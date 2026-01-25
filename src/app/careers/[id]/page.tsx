'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getCareerById, mockCareers } from '@/lib/mock-data';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Building2,
  CheckCircle,
  Upload,
  Send,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CareerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const career = getCareerById(id);
  const [isApplying, setIsApplying] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Get other positions
  const otherPositions = mockCareers.filter((c) => c.id !== id).slice(0, 3);

  if (!career) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">💼</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Vacante no encontrada
            </h1>
            <p className="text-gray-500 mb-6">
              La posición que buscas ya no está disponible
            </p>
            <Link
              href="/careers"
              className="px-6 py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
            >
              Ver todas las vacantes
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#212121] to-[#424242] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a vacantes
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-[#E53935] text-white text-sm font-medium rounded-full w-fit">
                {career.department}
              </span>
              <span className="text-white/60 text-sm">
                Publicado hace {career.postedDaysAgo} días
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white font-[Poppins,sans-serif] mb-6">
              {career.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-white/80">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {career.location}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {career.type}
              </span>
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {career.experience}
              </span>
              {career.salary && (
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {career.salary}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Job Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Descripción del puesto
                </h2>
                <p className="text-gray-600 leading-relaxed">{career.description}</p>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Requisitos</h2>
                <ul className="space-y-3">
                  {career.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Beneficios</h2>
                <ul className="space-y-3">
                  {career.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#E53935] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* About Company */}
              <div className="bg-[#E53935]/5 border border-[#E53935]/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#E53935] rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Sobre Eventu</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Eventu es la plataforma líder de boletas en Colombia. Conectamos a
                  millones de personas con los mejores eventos de música, deportes,
                  teatro y más. Nuestro equipo está comprometido con crear experiencias
                  memorables y revolucionar la industria del entretenimiento en
                  Latinoamérica.
                </p>
              </div>
            </div>

            {/* Apply Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                {!isApplying && !submitted ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      ¿Te interesa esta posición?
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      Únete a nuestro equipo y ayúdanos a transformar la industria del
                      entretenimiento
                    </p>
                    <button
                      onClick={() => setIsApplying(true)}
                      className="w-full py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
                    >
                      Aplicar ahora
                    </button>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Compartir vacante</p>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-[#0A66C2] text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
                          LinkedIn
                        </button>
                        <button className="flex-1 py-2 bg-[#1DA1F2] text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
                          Twitter
                        </button>
                      </div>
                    </div>
                  </>
                ) : submitted ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      ¡Aplicación enviada!
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Revisaremos tu perfil y te contactaremos pronto. ¡Gracias por tu
                      interés en unirte a Eventu!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Aplicar a: {career.title}
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        placeholder="Tu nombre"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        placeholder="+57 300 123 4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn (opcional)
                      </label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CV / Hoja de vida *
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-[#E53935] transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Arrastra o haz clic para subir
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PDF, DOC o DOCX (máx. 5MB)
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje (opcional)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        placeholder="Cuéntanos por qué te gustaría trabajar en Eventu..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsApplying(false)}
                        className="flex-1 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Enviar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Other Positions */}
        {otherPositions.length > 0 && (
          <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 font-[Poppins,sans-serif]">
                Otras posiciones abiertas
              </h2>
              <div className="space-y-4">
                {otherPositions.map((position) => (
                  <Link
                    key={position.id}
                    href={`/careers/${position.id}`}
                    className="block bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-sm text-[#E53935] font-medium">
                          {position.department}
                        </span>
                        <h3 className="font-semibold text-gray-900 text-lg mt-1">
                          {position.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {position.type}
                          </span>
                        </div>
                      </div>
                      <span className="text-[#E53935] font-medium whitespace-nowrap">
                        Ver detalles →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
