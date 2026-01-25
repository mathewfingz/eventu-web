import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { Footer } from '@/components/layout/footer';

export const metadata = {
    title: 'Preguntas Frecuentes | Eventu',
    description: 'Encuentra respuestas a las preguntas más comunes sobre Eventu.',
};

const faqCategories = [
    {
        name: 'Compras',
        questions: [
            {
                q: '¿Cómo compro boletas?',
                a: 'Busca tu evento, selecciona las boletas que deseas, elige tu método de pago (Nequi, PSE, tarjeta de crédito o Efecty) y completa la compra. Recibirás tus boletas por email inmediatamente.',
            },
            {
                q: '¿Qué métodos de pago aceptan?',
                a: 'Aceptamos Nequi, PSE (transferencia bancaria), tarjetas de crédito/débito (Visa, Mastercard, American Express), y Efecty para pago en efectivo.',
            },
            {
                q: '¿Puedo comprar boletas para otra persona?',
                a: 'Sí. Al momento de la compra, puedes ingresar los datos del asistente. La boleta quedará a nombre de esa persona.',
            },
            {
                q: '¿Hay límite de boletas por persona?',
                a: 'El límite depende de cada evento. Generalmente es de 4-8 boletas por persona para eventos de alta demanda.',
            },
        ],
    },
    {
        name: 'SafeTix',
        questions: [
            {
                q: '¿Qué es SafeTix?',
                a: 'SafeTix es nuestra tecnología anti-fraude que genera códigos QR dinámicos que cambian cada 15 segundos. Esto hace imposible la captura de pantalla o falsificación de boletas.',
            },
            {
                q: '¿Cómo accedo a mi boleta SafeTix?',
                a: 'Inicia sesión en tu cuenta de Eventu y ve a "Mis Boletas". El código QR se genera en tiempo real cuando abres la boleta.',
            },
            {
                q: '¿Qué pasa si no tengo internet en el evento?',
                a: 'Antes del evento, puedes descargar códigos offline que funcionan sin conexión. Ve a tu boleta y toca "Descargar para uso offline".',
            },
        ],
    },
    {
        name: 'Reembolsos',
        questions: [
            {
                q: '¿Puedo obtener un reembolso?',
                a: 'Las políticas de reembolso varían según el evento. Si el evento es cancelado, recibirás un reembolso automático en 5-10 días hábiles.',
            },
            {
                q: '¿Cuánto tarda el reembolso?',
                a: 'Los reembolsos se procesan en 5-10 días hábiles. El tiempo puede variar según tu método de pago original.',
            },
            {
                q: '¿Puedo cambiar mi boleta por otra fecha?',
                a: 'Depende del evento. Algunos organizadores permiten cambios de fecha. Contacta a soporte para verificar.',
            },
        ],
    },
    {
        name: 'Cuenta',
        questions: [
            {
                q: '¿Cómo recupero mi contraseña?',
                a: 'En la página de inicio de sesión, toca "¿Olvidaste tu contraseña?" e ingresa tu email. Recibirás un enlace para resetearla.',
            },
            {
                q: '¿Puedo transferir mis boletas a otra persona?',
                a: 'Sí. Ve a tu boleta y selecciona "Transferir". Ingresa el email del destinatario y confirma. La transferencia es instantánea.',
            },
            {
                q: '¿Es seguro guardar mi tarjeta?',
                a: 'Sí. Usamos encriptación de nivel bancario (PCI DSS) para proteger tus datos. Nunca almacenamos el CVV.',
            },
        ],
    },
];

export default function FAQPage() {
    return (
        <>
            <main className="min-h-screen bg-[#121212] text-white">
                {/* Hero */}
                <section className="relative py-24 px-4 bg-gradient-to-br from-[#E53935]/20 to-transparent">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6 font-[Poppins,sans-serif]">
                            Preguntas Frecuentes
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                            Encuentra respuestas rápidas a tus dudas.
                        </p>

                        {/* Search */}
                        <div className="max-w-md mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar pregunta..."
                                className="w-full pl-12 pr-4 py-4 bg-[#1E1E1E] border border-white/10 rounded-xl focus:outline-none focus:border-[#E53935]"
                            />
                        </div>
                    </div>
                </section>

                {/* FAQ Categories */}
                <section className="py-16 px-4">
                    <div className="max-w-4xl mx-auto">
                        {faqCategories.map((category) => (
                            <div key={category.name} className="mb-12">
                                <h2 className="text-2xl font-bold mb-6">{category.name}</h2>
                                <div className="space-y-4">
                                    {category.questions.map((faq, index) => (
                                        <details
                                            key={index}
                                            className="group bg-[#1E1E1E] rounded-xl overflow-hidden"
                                        >
                                            <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                                <span className="font-medium pr-4">{faq.q}</span>
                                                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                                            </summary>
                                            <div className="px-6 pb-6 text-gray-400">
                                                {faq.a}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Still need help */}
                <section className="py-16 px-4 bg-[#1E1E1E]">
                    <div className="max-w-xl mx-auto text-center">
                        <HelpCircle className="w-12 h-12 text-[#E53935] mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">¿No encontraste tu respuesta?</h2>
                        <p className="text-gray-300 mb-8">
                            Nuestro equipo de soporte está listo para ayudarte.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/chat"
                                className="px-8 py-4 bg-[#E53935] text-white rounded-full font-semibold hover:bg-[#B71C1C] transition-colors"
                            >
                                Chatear con soporte
                            </a>
                            <a
                                href="/contact"
                                className="px-8 py-4 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors"
                            >
                                Contactar
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
