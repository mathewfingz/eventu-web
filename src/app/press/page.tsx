import { Newspaper, Download, Mail, Calendar } from 'lucide-react';
import { Footer } from '@/components/layout/footer';

export const metadata = {
    title: 'Prensa | Eventu',
    description: 'Kit de prensa, noticias y recursos para medios de comunicación.',
};

const pressReleases = [
    {
        date: '2026-01-15',
        title: 'Eventu cierra ronda de $5M USD para expandirse en Latinoamérica',
        excerpt: 'La startup colombiana de ticketing anuncia inversión liderada por Andreessen Horowitz.',
    },
    {
        date: '2025-11-20',
        title: 'Eventu lanza SafeTix, tecnología anti-fraude para boletas',
        excerpt: 'Sistema de QR dinámico que elimina la reventa fraudulenta de entradas.',
    },
    {
        date: '2025-09-10',
        title: 'Eventu supera 500,000 boletas vendidas',
        excerpt: 'Hito alcanzado en menos de 2 años de operación.',
    },
    {
        date: '2025-06-01',
        title: 'Eventu gana premio Startup del Año en Colombia Startup Awards',
        excerpt: 'Reconocimiento a la innovación en tecnología para entretenimiento.',
    },
];

const mediaKit = [
    { name: 'Logo (PNG)', size: '2.5 MB' },
    { name: 'Logo (SVG)', size: '120 KB' },
    { name: 'Brand Guidelines', size: '8 MB' },
    { name: 'Product Screenshots', size: '15 MB' },
    { name: 'Founder Photos', size: '25 MB' },
];

export default function PressPage() {
    return (
        <>
            <main className="min-h-screen bg-[#121212] text-white">
                {/* Hero */}
                <section className="relative py-24 px-4 bg-gradient-to-br from-[#E53935]/20 to-transparent">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6 font-[Poppins,sans-serif]">
                            Prensa
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Recursos y noticias para medios de comunicación.
                        </p>
                    </div>
                </section>

                {/* Media Kit */}
                <section className="py-16 px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8">Kit de Prensa</h2>
                        <div className="bg-[#1E1E1E] rounded-xl p-6">
                            <div className="space-y-4">
                                {mediaKit.map((item) => (
                                    <div
                                        key={item.name}
                                        className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Download className="w-5 h-5 text-[#E53935]" />
                                            <span>{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-400">{item.size}</span>
                                            <button className="px-4 py-2 bg-[#E53935] text-white text-sm rounded-lg hover:bg-[#B71C1C] transition-colors">
                                                Descargar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <button className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                    Descargar todo (50 MB)
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Press Releases */}
                <section className="py-16 px-4 bg-[#1E1E1E]">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8">Comunicados de Prensa</h2>
                        <div className="space-y-6">
                            {pressReleases.map((release) => (
                                <article
                                    key={release.title}
                                    className="bg-[#212121] rounded-xl p-6 hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(release.date).toLocaleDateString('es-CO', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{release.title}</h3>
                                    <p className="text-gray-400">{release.excerpt}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="py-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <Newspaper className="w-12 h-12 text-[#E53935] mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">Contacto de Prensa</h2>
                        <p className="text-gray-300 mb-8">
                            Para entrevistas, comentarios o información adicional.
                        </p>
                        <a
                            href="mailto:prensa@eventu.co"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#E53935] text-white rounded-full font-semibold hover:bg-[#B71C1C] transition-colors"
                        >
                            <Mail className="w-5 h-5" />
                            prensa@eventu.co
                        </a>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
