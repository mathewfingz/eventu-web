'use client';

import { ChatWidget } from '@/components/chat/chat-widget';
import { Footer } from '@/components/layout/footer';

export default function ChatPage() {
    return (
        <>
            <main className="min-h-screen bg-[#121212] text-white">
                {/* Hero */}
                <section className="relative py-24 px-4 bg-gradient-to-br from-[#E53935]/20 to-transparent">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6 font-[Poppins,sans-serif]">
                            Chatbot de Soporte
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Nuestro asistente virtual está disponible 24/7 para ayudarte.
                        </p>
                    </div>
                </section>

                {/* Chat Container */}
                <section className="py-16 px-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-2xl" style={{ height: '600px' }}>
                            <ChatWidget isFullPage />
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-gray-400 text-sm">
                                ¿Prefieres hablar con un humano?{' '}
                                <a href="/contact" className="text-[#E53935] hover:underline">
                                    Contáctanos aquí
                                </a>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-16 px-4 bg-[#1E1E1E]">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-8 text-center">¿Qué puedo preguntarle?</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Feature
                                emoji="🎫"
                                title="Estado de boletas"
                                description="Consulta el estado de tus compras y boletas."
                            />
                            <Feature
                                emoji="💳"
                                title="Problemas de pago"
                                description="Ayuda con cobros, reembolsos y métodos de pago."
                            />
                            <Feature
                                emoji="📱"
                                title="SafeTix y QR"
                                description="Cómo usar tu boleta y el código QR dinámico."
                            />
                            <Feature
                                emoji="🔄"
                                title="Transferencias"
                                description="Cómo transferir boletas a otra persona."
                            />
                            <Feature
                                emoji="📅"
                                title="Info de eventos"
                                description="Horarios, ubicación y detalles del evento."
                            />
                            <Feature
                                emoji="🆘"
                                title="Escalación"
                                description="Si necesitas un agente humano, te conectamos."
                            />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

function Feature({
    emoji,
    title,
    description,
}: {
    emoji: string;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-[#212121] rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">{emoji}</div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
    );
}
