import { Briefcase, MapPin, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/layout/footer';

export const metadata = {
    title: 'Trabaja con Nosotros | Eventu',
    description: 'Únete al equipo de Eventu. Descubre oportunidades de trabajo en la startup de ticketing más innovadora de Colombia.',
};

const jobs = [
    {
        id: 1,
        title: 'Senior Backend Engineer',
        department: 'Engineering',
        location: 'Barranquilla / Remoto',
        type: 'Full-time',
        description: 'Construye sistemas de alta disponibilidad para millones de transacciones.',
    },
    {
        id: 2,
        title: 'iOS Developer',
        department: 'Mobile',
        location: 'Remoto',
        type: 'Full-time',
        description: 'Desarrolla la app iOS de Eventu con Swift y SwiftUI.',
    },
    {
        id: 3,
        title: 'Product Designer',
        department: 'Design',
        location: 'Bogotá / Remoto',
        type: 'Full-time',
        description: 'Diseña experiencias que deleiten a millones de usuarios.',
    },
    {
        id: 4,
        title: 'Customer Success Manager',
        department: 'Operations',
        location: 'Medellín',
        type: 'Full-time',
        description: 'Ayuda a organizadores a maximizar el éxito de sus eventos.',
    },
    {
        id: 5,
        title: 'Marketing Manager',
        department: 'Marketing',
        location: 'Bogotá',
        type: 'Full-time',
        description: 'Lidera campañas de marketing para eventos masivos.',
    },
];

const benefits = [
    { emoji: '🏠', title: 'Trabajo remoto', description: 'Trabaja desde donde quieras' },
    { emoji: '💰', title: 'Salario competitivo', description: 'Top 10% del mercado' },
    { emoji: '🏥', title: 'Salud premium', description: 'Plan médico completo' },
    { emoji: '🎫', title: 'Boletas gratis', description: 'Acceso a todos los eventos' },
    { emoji: '📚', title: 'Educación', description: '$2M COP/año en cursos' },
    { emoji: '🌴', title: 'Vacaciones', description: '20 días + cumpleaños' },
];

export default function CareersPage() {
    return (
        <>
            <main className="min-h-screen bg-[#121212] text-white">
                {/* Hero */}
                <section className="relative py-24 px-4 bg-gradient-to-br from-[#E53935]/20 to-transparent">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6 font-[Poppins,sans-serif]">
                            Trabaja con Nosotros
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Únete al equipo que está transformando la industria del entretenimiento en Colombia.
                        </p>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center">Beneficios</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {benefits.map((benefit) => (
                                <div key={benefit.title} className="bg-[#1E1E1E] rounded-xl p-4 text-center">
                                    <div className="text-3xl mb-2">{benefit.emoji}</div>
                                    <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                                    <p className="text-xs text-gray-400">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Open Positions */}
                <section className="py-16 px-4 bg-[#1E1E1E]">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center">Posiciones Abiertas</h2>
                        <div className="space-y-4">
                            {jobs.map((job) => (
                                <Link
                                    key={job.id}
                                    href={`/careers/${job.id}`}
                                    className="block bg-[#212121] rounded-xl p-6 hover:bg-[#2a2a2a] transition-colors group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-[#E53935]/20 text-[#E53935] text-xs rounded-full">
                                                    {job.department}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                                            <p className="text-gray-400 text-sm mb-3">{job.description}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {job.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {job.type}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-[#E53935] transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <Briefcase className="w-12 h-12 text-[#E53935] mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">¿No ves tu rol ideal?</h2>
                        <p className="text-gray-300 mb-8">
                            Siempre estamos buscando talento excepcional. Envíanos tu CV.
                        </p>
                        <a
                            href="mailto:careers@eventu.co"
                            className="inline-block px-8 py-4 bg-[#E53935] text-white rounded-full font-semibold hover:bg-[#B71C1C] transition-colors"
                        >
                            Enviar CV a careers@eventu.co
                        </a>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
