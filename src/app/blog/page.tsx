import { Calendar, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/layout/footer';

export const metadata = {
    title: 'Blog | Eventu',
    description: 'Noticias, tips y tendencias del mundo de los eventos en Colombia.',
};

const posts = [
    {
        slug: 'safetix-como-funciona',
        title: 'SafeTix: Cómo funciona nuestra tecnología anti-fraude',
        excerpt: 'Descubre cómo el QR dinámico de Eventu elimina la reventa fraudulenta y garantiza boletas 100% auténticas.',
        category: 'Tecnología',
        date: '2026-01-20',
        readTime: '5 min',
        image: '/blog/safetix.jpg',
    },
    {
        slug: 'mejores-conciertos-2026',
        title: 'Los 10 conciertos imperdibles de 2026 en Colombia',
        excerpt: 'Desde Shakira hasta Bad Bunny, estos son los eventos que no te puedes perder este año.',
        category: 'Eventos',
        date: '2026-01-15',
        readTime: '8 min',
        image: '/blog/concerts.jpg',
    },
    {
        slug: 'guia-organizadores',
        title: 'Guía completa para organizadores de eventos',
        excerpt: 'Todo lo que necesitas saber para crear y gestionar tu evento en Eventu.',
        category: 'Guías',
        date: '2026-01-10',
        readTime: '12 min',
        image: '/blog/guide.jpg',
    },
    {
        slug: 'reembolsos-politicas',
        title: 'Política de reembolsos: Lo que debes saber',
        excerpt: 'Entiende cuándo y cómo puedes solicitar un reembolso por tu boleta.',
        category: 'Ayuda',
        date: '2026-01-05',
        readTime: '4 min',
        image: '/blog/refunds.jpg',
    },
    {
        slug: 'split-payment-grupos',
        title: 'Split Payment: Divide el costo con tus amigos',
        excerpt: 'Nueva función que te permite compartir el costo de boletas grupales.',
        category: 'Novedades',
        date: '2025-12-20',
        readTime: '3 min',
        image: '/blog/split.jpg',
    },
    {
        slug: 'app-movil-proxima',
        title: 'App móvil: ¡Próximamente en iOS y Android!',
        excerpt: 'Adelanto exclusivo de lo que viene en nuestra aplicación móvil.',
        category: 'Novedades',
        date: '2025-12-15',
        readTime: '6 min',
        image: '/blog/app.jpg',
    },
];

const categories = ['Todos', 'Tecnología', 'Eventos', 'Guías', 'Ayuda', 'Novedades'];

export default function BlogPage() {
    return (
        <>
            <main className="min-h-screen bg-[#121212] text-white">
                {/* Hero */}
                <section className="relative py-24 px-4 bg-gradient-to-br from-[#E53935]/20 to-transparent">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6 font-[Poppins,sans-serif]">
                            Blog
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Noticias, tips y tendencias del mundo de los eventos.
                        </p>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-8 px-4 border-b border-white/10">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === 'Todos'
                                            ? 'bg-[#E53935] text-white'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Posts Grid */}
                <section className="py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className="group bg-[#1E1E1E] rounded-xl overflow-hidden hover:bg-[#252525] transition-colors"
                                >
                                    {/* Image Placeholder */}
                                    <div className="aspect-video bg-gradient-to-br from-[#E53935]/30 to-[#B71C1C]/30 flex items-center justify-center">
                                        <span className="text-4xl opacity-50">📰</span>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2 py-1 bg-[#E53935]/20 text-[#E53935] text-xs rounded-full">
                                                {post.category}
                                            </span>
                                            <span className="text-xs text-gray-500">{post.readTime}</span>
                                        </div>

                                        <h2 className="text-lg font-semibold mb-2 group-hover:text-[#E53935] transition-colors">
                                            {post.title}
                                        </h2>

                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(post.date).toLocaleDateString('es-CO', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-[#E53935] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter */}
                <section className="py-16 px-4 bg-[#1E1E1E]">
                    <div className="max-w-xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">Suscríbete al Newsletter</h2>
                        <p className="text-gray-300 mb-8">
                            Recibe las últimas noticias y ofertas exclusivas.
                        </p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                className="flex-1 px-4 py-3 bg-[#212121] border border-white/10 rounded-lg focus:outline-none focus:border-[#E53935]"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-[#E53935] text-white rounded-lg font-medium hover:bg-[#B71C1C] transition-colors"
                            >
                                Suscribir
                            </button>
                        </form>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
