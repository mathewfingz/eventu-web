import { RotateCcw, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/layout/footer';

export const metadata = {
    title: 'Política de Reembolsos | Eventu',
    description: 'Conoce nuestra política de reembolsos y cómo solicitar uno.',
};

export default function RefundsPage() {
    return (
        <>
            <main className="min-h-screen bg-[#121212] text-white">
                {/* Hero */}
                <section className="relative py-24 px-4 bg-gradient-to-br from-[#E53935]/20 to-transparent">
                    <div className="max-w-4xl mx-auto text-center">
                        <RotateCcw className="w-16 h-16 text-[#E53935] mx-auto mb-6" />
                        <h1 className="text-5xl font-bold mb-6 font-[Poppins,sans-serif]">
                            Política de Reembolsos
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Información sobre cuándo y cómo puedes solicitar un reembolso.
                        </p>
                    </div>
                </section>

                {/* When you can get a refund */}
                <section className="py-16 px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8">¿Cuándo aplica un reembolso?</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Eligible */}
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-400">
                                    <CheckCircle className="w-6 h-6" />
                                    Sí aplica reembolso
                                </h3>
                                <ul className="space-y-3 text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        Evento cancelado por el organizador
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        Evento reprogramado (si no puedes asistir)
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        Error de cobro doble
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        Boleta no recibida por fallo técnico
                                    </li>
                                </ul>
                            </div>

                            {/* Not Eligible */}
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-400">
                                    <XCircle className="w-6 h-6" />
                                    No aplica reembolso
                                </h3>
                                <ul className="space-y-3 text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400">✗</span>
                                        Cambio de planes personales
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400">✗</span>
                                        Compra incorrecta (fecha, zona, cantidad)
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400">✗</span>
                                        No asistencia al evento
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400">✗</span>
                                        Boleta ya transferida o usada
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Process */}
                <section className="py-16 px-4 bg-[#1E1E1E]">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8">¿Cómo solicitar un reembolso?</h2>

                        <div className="space-y-6">
                            <Step
                                number={1}
                                title="Inicia sesión en tu cuenta"
                                description="Ve a 'Mis Boletas' y selecciona la orden que deseas reembolsar."
                            />
                            <Step
                                number={2}
                                title="Selecciona 'Solicitar Reembolso'"
                                description="Elige el motivo y adjunta cualquier evidencia necesaria."
                            />
                            <Step
                                number={3}
                                title="Espera la revisión"
                                description="Nuestro equipo revisará tu solicitud en 24-48 horas."
                            />
                            <Step
                                number={4}
                                title="Recibe tu reembolso"
                                description="Si es aprobado, el dinero llegará en 5-10 días hábiles."
                            />
                        </div>
                    </div>
                </section>

                {/* Timeframes */}
                <section className="py-16 px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                            <Clock className="w-8 h-8 text-[#E53935]" />
                            Tiempos de procesamiento
                        </h2>

                        <div className="bg-[#1E1E1E] rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-[#212121]">
                                    <tr>
                                        <th className="text-left p-4 font-semibold">Método de pago</th>
                                        <th className="text-left p-4 font-semibold">Tiempo de reembolso</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    <tr>
                                        <td className="p-4">Nequi</td>
                                        <td className="p-4 text-gray-400">1-3 días hábiles</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4">PSE</td>
                                        <td className="p-4 text-gray-400">3-5 días hábiles</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4">Tarjeta de crédito/débito</td>
                                        <td className="p-4 text-gray-400">5-10 días hábiles</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4">Efecty</td>
                                        <td className="p-4 text-gray-400">Cupón de crédito en Eventu*</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p className="text-sm text-gray-500 mt-4">
                            * Los pagos en efectivo no son reembolsables en efectivo.
                            Se genera un cupón de crédito para uso en Eventu.
                        </p>
                    </div>
                </section>

                {/* Important Notice */}
                <section className="py-16 px-4 bg-[#1E1E1E]">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-yellow-400 mb-2">Importante</h3>
                                    <p className="text-gray-300">
                                        Las políticas de reembolso pueden variar según el evento.
                                        Algunos organizadores no permiten reembolsos bajo ninguna circunstancia.
                                        Verifica los términos específicos del evento antes de comprar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 px-4">
                    <div className="max-w-xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">¿Necesitas ayuda?</h2>
                        <p className="text-gray-300 mb-8">
                            Si tienes dudas sobre tu reembolso, contáctanos.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/contact"
                                className="px-8 py-4 bg-[#E53935] text-white rounded-full font-semibold hover:bg-[#B71C1C] transition-colors"
                            >
                                Contactar soporte
                            </Link>
                            <Link
                                href="/faq"
                                className="px-8 py-4 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors"
                            >
                                Ver FAQ
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

function Step({
    number,
    title,
    description,
}: {
    number: number;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#E53935] rounded-full flex items-center justify-center font-bold">
                {number}
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-1">{title}</h3>
                <p className="text-gray-400">{description}</p>
            </div>
        </div>
    );
}
