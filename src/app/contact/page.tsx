import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import { Footer } from '@/components/layout/footer';

export const metadata = {
    title: 'Contacto | Eventu',
    description: 'Contáctanos. Estamos aquí para ayudarte.',
};

export default function ContactPage() {
    return (
        <>
            <main className="min-h-screen bg-[#121212] text-white">
                {/* Hero */}
                <section className="relative py-24 px-4 bg-gradient-to-br from-[#E53935]/20 to-transparent">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6 font-[Poppins,sans-serif]">
                            Contacto
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            ¿Tienes preguntas? Estamos aquí para ayudarte.
                        </p>
                    </div>
                </section>

                <section className="py-16 px-4">
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="bg-[#1E1E1E] rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6">Envíanos un mensaje</h2>
                            <form className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Nombre</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-[#212121] border border-white/10 rounded-lg focus:outline-none focus:border-[#E53935]"
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 bg-[#212121] border border-white/10 rounded-lg focus:outline-none focus:border-[#E53935]"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Asunto</label>
                                    <select className="w-full px-4 py-3 bg-[#212121] border border-white/10 rounded-lg focus:outline-none focus:border-[#E53935]">
                                        <option value="">Selecciona un tema</option>
                                        <option value="purchase">Problema con compra</option>
                                        <option value="refund">Solicitar reembolso</option>
                                        <option value="account">Problema con cuenta</option>
                                        <option value="organizer">Soy organizador</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Número de orden (opcional)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-[#212121] border border-white/10 rounded-lg focus:outline-none focus:border-[#E53935]"
                                        placeholder="EVT-XXXXXX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Mensaje</label>
                                    <textarea
                                        rows={5}
                                        className="w-full px-4 py-3 bg-[#212121] border border-white/10 rounded-lg focus:outline-none focus:border-[#E53935] resize-none"
                                        placeholder="Describe tu consulta..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-[#E53935] text-white rounded-lg font-semibold hover:bg-[#B71C1C] transition-colors"
                                >
                                    Enviar mensaje
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            {/* Quick Contact */}
                            <div className="bg-[#1E1E1E] rounded-2xl p-8">
                                <h2 className="text-2xl font-bold mb-6">Contacto directo</h2>
                                <div className="space-y-4">
                                    <a
                                        href="mailto:info@eventu.co"
                                        className="flex items-center gap-4 p-4 bg-[#212121] rounded-xl hover:bg-[#2a2a2a] transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-[#E53935]/20 rounded-full flex items-center justify-center">
                                            <Mail className="w-6 h-6 text-[#E53935]" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Email</p>
                                            <p className="text-gray-400 text-sm">info@eventu.co</p>
                                        </div>
                                    </a>

                                    <a
                                        href="tel:+573002850000"
                                        className="flex items-center gap-4 p-4 bg-[#212121] rounded-xl hover:bg-[#2a2a2a] transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-[#E53935]/20 rounded-full flex items-center justify-center">
                                            <Phone className="w-6 h-6 text-[#E53935]" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Teléfono</p>
                                            <p className="text-gray-400 text-sm">(300) 285-0000</p>
                                        </div>
                                    </a>

                                    <a
                                        href="https://wa.me/573002850000"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 bg-[#212121] rounded-xl hover:bg-[#2a2a2a] transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                            <MessageCircle className="w-6 h-6 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">WhatsApp</p>
                                            <p className="text-gray-400 text-sm">Chat en tiempo real</p>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* Hours */}
                            <div className="bg-[#1E1E1E] rounded-2xl p-8">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-[#E53935]" />
                                    Horario de atención
                                </h3>
                                <div className="space-y-2 text-gray-300">
                                    <p>Lunes - Viernes: 8:00 AM - 8:00 PM</p>
                                    <p>Sábado: 9:00 AM - 5:00 PM</p>
                                    <p>Domingo: 10:00 AM - 2:00 PM</p>
                                </div>
                                <p className="text-sm text-gray-500 mt-4">
                                    * Durante eventos, extendemos horario hasta la finalización.
                                </p>
                            </div>

                            {/* Location */}
                            <div className="bg-[#1E1E1E] rounded-2xl p-8">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-[#E53935]" />
                                    Oficina principal
                                </h3>
                                <p className="text-gray-300">
                                    Calle 84 #51-50, Oficina 401<br />
                                    Barranquilla, Atlántico<br />
                                    Colombia 🇨🇴
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
