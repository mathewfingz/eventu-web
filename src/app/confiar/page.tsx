'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// FAQ Data
const faqs = [
  {
    question: '¿Eventu es confiable?',
    answer: 'Sí, Eventu es completamente confiable. Somos la plataforma de ticketing más segura de Colombia con tecnología SafeTix que garantiza la autenticidad de cada boleta. Trabajamos directamente con organizadores verificados y contamos con respaldo de las principales entidades financieras del país.'
  },
  {
    question: '¿Las boletas compradas en Eventu son seguras?',
    answer: 'Absolutamente. Cada boleta en Eventu cuenta con tecnología SafeTix: códigos QR dinámicos que cambian cada 30 segundos, haciendo imposible la falsificación o duplicación. Además, todas las transacciones están protegidas con encriptación de grado bancario.'
  },
  {
    question: '¿Cómo funciona la Garantía Eventu?',
    answer: 'La Garantía Eventu te protege al 100%. Si tu evento es cancelado, recibes reembolso completo. Si hay algún problema con tu boleta, te proporcionamos entrada de reemplazo o te devolvemos tu dinero. Sin preguntas, sin complicaciones.'
  },
  {
    question: '¿Cómo funciona Eventu?',
    answer: 'Eventu te permite comprar boletas directamente de organizadores oficiales o de otros fans de manera segura. Busca tu evento, selecciona tus asientos con vista previa 360°, paga con tu método preferido (Nequi, MercadoPago, tarjeta, PSE) y recibe tus boletas digitales instantáneamente.'
  },
  {
    question: '¿Eventu cobra comisiones ocultas?',
    answer: 'No. En Eventu mostramos el precio total desde el inicio. Nuestro sistema de "Precio Transparente" incluye todas las comisiones en el precio que ves, sin sorpresas al momento de pagar.'
  },
  {
    question: '¿Puedo obtener reembolso de mis boletas?',
    answer: 'Sí. Muchas boletas en Eventu son reembolsables hasta cierto período antes del evento. Además, si el evento es cancelado o reprogramado, siempre tienes derecho a reembolso completo automático.'
  },
  {
    question: '¿Cómo contacto al soporte de Eventu?',
    answer: 'Nuestro equipo de soporte está disponible 24/7 a través de chat en vivo, WhatsApp, correo electrónico (soporte@eventu.com.co) y teléfono. También contamos con un asistente de IA que puede resolver la mayoría de consultas instantáneamente.'
  }
];

// Trust icons data
const trustCards = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    gradient: 'from-emerald-400 to-green-500',
    title: 'Garantía Eventu',
    description: 'Cada boleta está respaldada por nuestra garantía 100%. Si algo sale mal, te cubrimos.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    gradient: 'from-amber-400 to-orange-500',
    title: 'Precio Transparente',
    description: 'El precio que ves es el precio que pagas. Cero sorpresas, cero cargos ocultos.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    gradient: 'from-rose-400 to-red-500',
    title: 'Pago Seguro',
    description: 'Encriptación de grado bancario. Nequi, tarjetas, PSE y MercadoPago protegidos.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    gradient: 'from-violet-400 to-purple-500',
    title: 'Entrega Instantánea',
    description: 'Boletas digitales en tu teléfono al instante. Sin esperas, sin papeles.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M12 12h.01" />
        <path d="M17 12h.01" />
        <path d="M7 12h.01" />
      </svg>
    ),
    gradient: 'from-cyan-400 to-blue-500',
    title: 'Boletas Reembolsables',
    description: 'Flexibilidad cuando la necesitas. Busca el ícono "Reembolsable" al comprar.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    gradient: 'from-pink-400 to-rose-500',
    title: 'Soporte 24/7',
    description: 'Ayuda real cuando la necesitas. Chat en vivo, WhatsApp e IA disponibles siempre.'
  }
];

// Reviews data
const reviews = [
  {
    name: 'Carolina M.',
    location: 'Bogotá',
    text: 'Compré boletas para Coldplay y todo fue perfecto. El código QR dinámico es genial.',
    rating: 5
  },
  {
    name: 'Andrés F.',
    location: 'Medellín',
    text: 'El precio que vi fue el que pagué. Cero sorpresas. Además la vista previa del asiento me ayudó muchísimo.',
    rating: 5
  },
  {
    name: 'María José R.',
    location: 'Cali',
    text: 'Mi evento fue cancelado y recibí el reembolso en menos de 48 horas. Increíble servicio.',
    rating: 5
  },
  {
    name: 'Juan Pablo S.',
    location: 'Barranquilla',
    text: 'Compré a las 2am y las tuve en mi celular instantáneamente. El día del evento solo escaneé y entré.',
    rating: 5
  }
];

// Stats
const stats = [
  { number: '2M+', label: 'Boletas vendidas' },
  { number: '500K+', label: 'Usuarios felices' },
  { number: '99.9%', label: 'Entradas válidas' },
  { number: '4.9', label: 'Calificación App' }
];

// QR grid pattern
const qrPattern = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1];

export default function ConfiarPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="trust-page">
      {/* Sticky Navigation */}
      <nav className="trust-nav glass">
        <Link href="/" className="trust-logo">
          <div className="trust-logo-icon">E</div>
          <span>eventu</span>
        </Link>
        <div className="trust-nav-links">
          <a href="#garantias">Garantías</a>
          <a href="#caracteristicas">Características</a>
          <a href="#opiniones">Opiniones</a>
          <a href="#faqs">FAQs</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="trust-hero">
        <div className="hero-glow" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1>
            ¿Es <span className="gradient-text">Eventu</span> confiable?
          </h1>
          <p className="hero-subtitle">
            La plataforma de ticketing más segura de Colombia. Tecnología que protege,
            experiencias que inspiran.
          </p>
        </motion.div>

        {/* Photo Collage */}
        <motion.div
          className="photo-collage"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="photo-grid">
            <motion.div
              className="photo photo-1"
              whileHover={{ scale: 1.02, zIndex: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop" alt="Concert" />
            </motion.div>
            <motion.div
              className="photo photo-2"
              whileHover={{ scale: 1.02, zIndex: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop" alt="Festival" />
            </motion.div>
            <motion.div
              className="photo photo-3"
              whileHover={{ scale: 1.02, zIndex: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=400&fit=crop" alt="Fans" />
            </motion.div>
            <motion.div
              className="photo photo-4"
              whileHover={{ scale: 1.02, zIndex: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop" alt="Event" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <p className="partners-label">Aliados oficiales</p>
        <div className="partners-grid">
          {['Movistar Arena', 'El Campín', 'Teatro Mayor', 'Corferias', 'Coliseo Live', 'Autódromo'].map((partner, i) => (
            <motion.div
              key={partner}
              className="partner-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {partner}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Cards Section */}
      <section id="garantias" className="trust-section">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Compra con confianza
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Nuestro compromiso con la seguridad te da tranquilidad en cada compra.
          </motion.p>
        </div>

        <div className="trust-cards">
          {trustCards.map((card, index) => (
            <motion.div
              key={index}
              className="trust-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className={`card-icon bg-gradient-to-br ${card.gradient}`}>
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="features-section">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Tecnología de punta
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Funciones inteligentes para la mejor experiencia de compra.
          </motion.p>
        </div>

        <div className="features-grid">
          {/* Feature 1 - Seat View */}
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="feature-text">
              <h3>Vista desde tu asiento</h3>
              <p>Ve exactamente cómo se verá el escenario desde cada sección. Fotos 360° reales para elegir el lugar perfecto.</p>
            </div>
            <div className="feature-visual">
              <div className="mockup">
                <div className="mockup-screen">
                  <div className="stage-preview">
                    <div className="stage-icon">🎤</div>
                    <span className="view-label">Vista 360°</span>
                  </div>
                  <div className="seat-details">
                    <span>Sección A3 · Fila 12</span>
                    <span className="price">$285.000</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2 - Deal Score */}
          <motion.div
            className="feature-card reverse"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="feature-text">
              <h3>Deal Score™</h3>
              <p>Nuestro algoritmo analiza cada boleta y te muestra si es buen precio. Nunca pagarás de más.</p>
            </div>
            <div className="feature-visual">
              <div className="mockup">
                <div className="mockup-screen deal-screen">
                  <div className="deal-circle">
                    <span className="score">87</span>
                    <span className="label">Excelente</span>
                  </div>
                  <div className="deal-bars">
                    <div className="bar-item">
                      <span>Precio</span>
                      <div className="bar"><div style={{ width: '90%' }} /></div>
                    </div>
                    <div className="bar-item">
                      <span>Ubicación</span>
                      <div className="bar"><div style={{ width: '85%' }} /></div>
                    </div>
                    <div className="bar-item">
                      <span>Demanda</span>
                      <div className="bar"><div style={{ width: '75%' }} /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 3 - SafeTix */}
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="feature-text">
              <h3>SafeTix™ Anti-fraude</h3>
              <p>Códigos QR dinámicos que cambian cada 30 segundos. Imposible de falsificar, copiar o compartir.</p>
            </div>
            <div className="feature-visual">
              <div className="mockup">
                <div className="mockup-screen safetix-screen">
                  <div className="qr-container">
                    <div className="qr-grid">
                      {qrPattern.map((filled, i) => (
                        <div key={i} className={`qr-cell ${filled ? 'filled' : ''}`} />
                      ))}
                    </div>
                  </div>
                  <div className="safetix-status">
                    <span className="pulse-dot" />
                    SafeTix™ Activo
                  </div>
                  <span className="timer">Actualiza en 28s</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="opiniones" className="reviews-section">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Lo que dicen nuestros usuarios
          </motion.h2>
        </div>

        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              className="review-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring" }}
            >
              <div className="review-stars">
                {Array(5).fill(0).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p>&ldquo;{review.text}&rdquo;</p>
              <div className="review-author">
                <strong>{review.name}</strong>
                <span>{review.location}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-item"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            >
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="faq-section">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Preguntas frecuentes
          </motion.h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span>{faq.question}</span>
                <motion.span
                  className="faq-icon"
                  animate={{ rotate: openFaq === index ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>¿Listo para tu próximo evento?</h2>
          <p>Únete a miles de fans que confían en Eventu.</p>
          <div className="cta-buttons">
            <Link href="/" className="btn-primary btn-premium">
              Explorar eventos
            </Link>
            <Link href="/app" className="btn-secondary btn-premium">
              Descargar App
            </Link>
          </div>
        </motion.div>
      </section>

      <style jsx>{`
        .trust-page {
          background: #FFFFFF;
          min-height: 100vh;
        }

        /* Navigation */
        .trust-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .trust-logo {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          text-decoration: none;
          color: #1D1D1F;
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
        }

        .trust-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #FF6B6B 0%, #FF3B30 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 1.125rem;
        }

        .trust-nav-links {
          display: flex;
          gap: 2.5rem;
        }

        .trust-nav-links a {
          color: #86868B;
          text-decoration: none;
          font-size: 0.9375rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .trust-nav-links a:hover {
          color: #1D1D1F;
        }

        /* Hero Section */
        .trust-hero {
          position: relative;
          padding: 6rem 2rem 4rem;
          text-align: center;
          overflow: hidden;
        }

        .hero-glow {
          position: absolute;
          top: -50%;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 59, 48, 0.12), transparent);
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
        }

        .trust-hero h1 {
          font-size: clamp(2.25rem, 4vw + 0.5rem, 3.5rem);
          font-weight: 700;
          color: #1D1D1F;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
        }

        .hero-subtitle {
          font-size: 1.125rem;
          color: #86868B;
          line-height: 1.6;
          max-width: 520px;
          margin: 0 auto;
          letter-spacing: -0.005em;
        }

        /* Photo Collage */
        .photo-collage {
          margin-top: 4rem;
          padding: 0 1rem;
        }

        .photo-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .photo {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }

        .photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .photo-1 { grid-column: span 2; height: 280px; }
        .photo-2 { height: 280px; }
        .photo-3 { grid-column: span 2; height: 200px; }
        .photo-4 { grid-column: span 2; height: 200px; }

        /* Partners Section */
        .partners-section {
          padding: 4rem 2rem;
          text-align: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .partners-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #86868B;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
        }

        .partners-grid {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 2rem 3rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .partner-item {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1D1D1F;
          opacity: 0.7;
        }

        /* Trust Section */
        .trust-section {
          padding: 6rem 2rem;
          background: #F5F5F7;
        }

        .section-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 4rem;
        }

        .section-header h2 {
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          font-weight: 600;
          color: #1D1D1F;
          letter-spacing: -0.015em;
          margin-bottom: 0.75rem;
        }

        .section-header p {
          font-size: 1rem;
          color: #86868B;
          line-height: 1.6;
        }

        .trust-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .trust-card {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.06);
          transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: white;
        }

        .card-icon svg {
          width: 28px;
          height: 28px;
        }

        .trust-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1D1D1F;
          margin-bottom: 0.625rem;
          letter-spacing: -0.01em;
        }

        .trust-card p {
          font-size: 0.9375rem;
          color: #86868B;
          line-height: 1.6;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 2rem;
        }

        .features-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }

        .feature-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .feature-card.reverse {
          direction: rtl;
        }

        .feature-card.reverse > * {
          direction: ltr;
        }

        .feature-text h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1D1D1F;
          margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }

        .feature-text p {
          font-size: 1.0625rem;
          color: #86868B;
          line-height: 1.7;
        }

        .mockup {
          background: #F5F5F7;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
        }

        .mockup-screen {
          background: white;
          border-radius: 14px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .stage-preview {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          margin-bottom: 1rem;
        }

        .stage-icon {
          font-size: 2.5rem;
        }

        .view-label {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #1D1D1F;
        }

        .seat-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: #86868B;
        }

        .seat-details .price {
          font-weight: 700;
          color: #FF3B30;
          font-size: 1rem;
        }

        /* Deal Score Screen */
        .deal-screen {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .deal-circle {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, #34C759, #30D158);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .deal-circle .score {
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1;
        }

        .deal-circle .label {
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .deal-bars {
          flex: 1;
        }

        .bar-item {
          margin-bottom: 0.75rem;
        }

        .bar-item:last-child {
          margin-bottom: 0;
        }

        .bar-item span {
          font-size: 0.75rem;
          color: #86868B;
          display: block;
          margin-bottom: 0.25rem;
        }

        .bar {
          height: 6px;
          background: #F5F5F7;
          border-radius: 3px;
          overflow: hidden;
        }

        .bar div {
          height: 100%;
          background: linear-gradient(90deg, #34C759, #30D158);
          border-radius: 3px;
        }

        /* SafeTix Screen */
        .safetix-screen {
          text-align: center;
        }

        .qr-container {
          width: 100px;
          height: 100px;
          margin: 0 auto 1rem;
          padding: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .qr-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2px;
          height: 100%;
        }

        .qr-cell {
          background: #E5E5E5;
          border-radius: 2px;
        }

        .qr-cell.filled {
          background: #1D1D1F;
        }

        .safetix-status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #34C759;
          color: white;
          padding: 0.375rem 0.875rem;
          border-radius: 20px;
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .timer {
          font-size: 0.75rem;
          color: #86868B;
        }

        /* Reviews Section */
        .reviews-section {
          padding: 6rem 2rem;
          background: #F5F5F7;
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .review-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04);
        }

        .review-stars {
          color: #FF9500;
          font-size: 1.125rem;
          margin-bottom: 1rem;
          letter-spacing: 2px;
        }

        .review-card p {
          font-size: 1rem;
          color: #1D1D1F;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .review-author {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .review-author strong {
          font-weight: 600;
          color: #1D1D1F;
        }

        .review-author span {
          color: #86868B;
          font-size: 0.875rem;
        }

        /* Stats Section */
        .stats-section {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #FF6B6B 0%, #FF3B30 100%);
          position: relative;
          overflow: hidden;
        }

        .stats-section::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .stat-item {
          color: white;
        }

        .stat-number {
          display: block;
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.9375rem;
          opacity: 0.9;
        }

        /* FAQ Section */
        .faq-section {
          padding: 6rem 2rem;
        }

        .faq-list {
          max-width: 700px;
          margin: 0 auto;
        }

        .faq-item {
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 0;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .faq-question span:first-child {
          font-size: 1.0625rem;
          font-weight: 600;
          color: #1D1D1F;
          letter-spacing: -0.01em;
        }

        .faq-icon {
          font-size: 1.5rem;
          color: #86868B;
          font-weight: 300;
        }

        .faq-answer {
          overflow: hidden;
        }

        .faq-answer p {
          padding-bottom: 1.5rem;
          color: #86868B;
          line-height: 1.7;
          font-size: 1rem;
        }

        /* CTA Section */
        .cta-section {
          padding: 6rem 2rem;
          background: #1D1D1F;
          text-align: center;
        }

        .cta-content h2 {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 700;
          color: white;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }

        .cta-content p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Button overrides for CTA */
        .cta-section :global(.btn-secondary) {
          color: white;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .cta-section :global(.btn-secondary:hover) {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .trust-nav-links {
            display: none;
          }

          .photo-grid {
            grid-template-columns: 1fr 1fr;
          }

          .photo-1 { grid-column: span 2; height: 200px; }
          .photo-2 { height: 150px; }
          .photo-3 { height: 150px; }
          .photo-4 { grid-column: span 2; height: 150px; }

          .feature-card,
          .feature-card.reverse {
            grid-template-columns: 1fr;
            gap: 2rem;
            direction: ltr;
          }

          .trust-section,
          .features-section,
          .reviews-section,
          .faq-section {
            padding: 4rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
