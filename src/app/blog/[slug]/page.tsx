'use client';

import { use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getBlogPostBySlug, mockBlogPosts } from '@/lib/mock-data';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  const { slug } = use(params);
  const post = getBlogPostBySlug(slug);

  // Get related posts (excluding current)
  const relatedPosts = mockBlogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📝</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Artículo no encontrado
            </h1>
            <p className="text-gray-500 mb-6">
              El artículo que buscas no existe o ha sido eliminado
            </p>
            <Link
              href="/blog"
              className="px-6 py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
            >
              Ver todos los artículos
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const postDate = new Date(post.publishedAt);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[400px] sm:h-[500px]">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al blog
              </Link>
              <span className="inline-block px-3 py-1 bg-[#E53935] text-white text-sm font-medium rounded-full mb-4">
                {post.category}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-[Poppins,sans-serif] mb-4">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author.name}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(postDate, "d 'de' MMMM, yyyy", { locale: es })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readTime} min de lectura
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Share Sidebar */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <p className="text-sm font-medium text-gray-500 mb-4">Compartir</p>
                <div className="flex lg:flex-col gap-3">
                  <button className="p-3 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity">
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-[#0A66C2] text-white rounded-lg hover:opacity-90 transition-opacity">
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    <LinkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </aside>

            {/* Article */}
            <article className="lg:col-span-3 order-1 lg:order-2">
              <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                {/* Excerpt */}
                <p className="text-xl text-gray-600 leading-relaxed mb-8 border-l-4 border-[#E53935] pl-4">
                  {post.excerpt}
                </p>

                {/* Content - In a real app, this would be rich content from a CMS */}
                <div className="prose prose-lg max-w-none">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                    ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.
                  </p>

                  <h2>La importancia de la experiencia en vivo</h2>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse
                    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt mollit
                    anim id est laborum.
                  </p>

                  <blockquote>
                    "Los eventos en vivo crean memorias que duran toda la vida. No hay
                    nada como la emoción de compartir un momento con miles de personas."
                  </blockquote>

                  <p>
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                    accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                    quae ab illo inventore veritatis et quasi architecto beatae vitae
                    dicta sunt explicabo.
                  </p>

                  <h2>Tendencias para el próximo año</h2>
                  <p>
                    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                    aut fugit, sed quia consequuntur magni dolores eos qui ratione
                    voluptatem sequi nesciunt.
                  </p>

                  <ul>
                    <li>Experiencias inmersivas y tecnología</li>
                    <li>Sostenibilidad en eventos</li>
                    <li>Festivales boutique y experiencias exclusivas</li>
                    <li>Integración del mundo digital y físico</li>
                  </ul>

                  <p>
                    Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
                    consectetur, adipisci velit, sed quia non numquam eius modi tempora
                    incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
                  </p>
                </div>

                {/* Tags */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-3">Etiquetas</p>
                  <div className="flex flex-wrap gap-2">
                    {['Eventos', 'Tendencias', 'Música', 'Entretenimiento'].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Author Box */}
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-[#E53935] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {post.author.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Escrito por</p>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {post.author.name}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Apasionado por los eventos en vivo y la música. Escribe sobre las
                      últimas tendencias y noticias del mundo del entretenimiento.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Related Posts */}
        <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 font-[Poppins,sans-serif]">
              Artículos relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <div className="bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={relatedPost.imageUrl}
                      alt={relatedPost.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-[#E53935] font-medium">
                      {relatedPost.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-[#E53935] transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="bg-[#212121] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4 font-[Poppins,sans-serif]">
              Suscríbete a nuestro newsletter
            </h2>
            <p className="text-gray-400 mb-6">
              Recibe los mejores artículos y noticias sobre eventos directamente en tu
              correo
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
