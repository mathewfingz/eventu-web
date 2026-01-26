import { Users, Shield, Zap, Heart, MapPin, Award } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata = {
    title: 'Nosotros | Eventu',
    description: 'Conoce la historia de Eventu, la plataforma de boletas más segura de Colombia.',
};

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-white text-[#212121]">
                {/* Hero */}
                <section className="relative py-24 px-4 bg-gradient-to-br from-[#E53935]/10 to-transparent">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6 font-[Poppins,sans-serif] text-[#212121]">
                            Nosotros
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Somos la plataforma de ticketing más segura de Colombia.
                            Conectamos a los colombianos con los mejores eventos.
                        </p>
                    </div>
                </section>

                {/* Mission */}
                <section className="py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6 text-[#212121]">Nuestra Misión</h2>
                                <p className="text-gray-600 mb-4">
                                    En Eventu, creemos que cada persona merece acceso seguro y justo a
                                    los eventos que aman. Nuestra misión es eliminar el fraude de boletas
                                    y hacer que la experiencia de compra sea transparente y confiable.
                                </p>
                                <p className="text-gray-600">
                                    Nacimos en Barranquilla, Colombia, con la visión de transformar la
                                    industria del entretenimiento en Latinoamérica.
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                                <div className="grid grid-cols-2 gap-6">
                                    <Stat value="500K+" label="Boletas vendidas" />
                                    <Stat value="1,200+" label="Eventos" />
                                    <Stat value="50+" label="Ciudades" />
                                    <Stat value="99.9%" label="Uptime" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-16 px-4 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center text-[#212121]">Nuestros Valores</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <ValueCard
                                icon={Shield}
                                title="Seguridad Primero"
                                description="SafeTix garantiza que cada boleta es auténtica con tecnología anti-fraude."
                            />
                            <ValueCard
                                icon={Zap}
                                title="Innovación"
                                description="Tecnología de punta con IA para mejorar cada aspecto de la experiencia."
                            />
                            <ValueCard
                                icon={Heart}
                                title="Pasión por Colombia"
                                description="Orgullosamente colombianos, apoyando artistas y eventos locales."
                            />
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section className="py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center text-[#212121]">Nuestro Equipo</h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            <TeamMember name="Carlos Mejía" role="CEO & Fundador" />
                            <TeamMember name="Laura González" role="CTO" />
                            <TeamMember name="Andrés Restrepo" role="Head of Product" />
                            <TeamMember name="María Fernanda" role="Head of Operations" />
                        </div>
                    </div>
                </section>

                {/* Location */}
                <section className="py-16 px-4 bg-gray-50">
                    <div className="max-w-4xl mx-auto text-center">
                        <MapPin className="w-12 h-12 text-[#E53935] mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4 text-[#212121]">Hecho en Colombia</h2>
                        <p className="text-gray-600 mb-8">
                            Nuestra oficina principal está en Barranquilla, con equipos
                            distribuidos en Bogotá, Medellín y Cali.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E53935]/10 rounded-full text-[#E53935]">
                            <Award className="w-5 h-5" />
                            Premio Startup del Año 2025
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <p className="text-3xl font-bold text-[#E53935]">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
    );
}

function ValueCard({
    icon: Icon,
    title,
    description,
}: {
    icon: any;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-[#E53935]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-[#E53935]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#212121]">{title}</h3>
            <p className="text-gray-500 text-sm">{description}</p>
        </div>
    );
}

function TeamMember({ name, role }: { name: string; role: string }) {
    return (
        <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#E53935] to-[#B71C1C] rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold text-[#212121]">{name}</h3>
            <p className="text-sm text-gray-500">{role}</p>
        </div>
    );
}
