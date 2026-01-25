import { FileText } from 'lucide-react';
import { Footer } from '@/components/layout/footer';

export const metadata = {
    title: 'Términos y Condiciones | Eventu',
    description: 'Términos y condiciones de uso de la plataforma Eventu.',
};

export default function TermsPage() {
    return (
        <>
            <main className="min-h-screen bg-[#121212] text-white">
                {/* Hero */}
                <section className="relative py-24 px-4 bg-gradient-to-br from-[#E53935]/20 to-transparent">
                    <div className="max-w-4xl mx-auto text-center">
                        <FileText className="w-16 h-16 text-[#E53935] mx-auto mb-6" />
                        <h1 className="text-5xl font-bold mb-6 font-[Poppins,sans-serif]">
                            Términos y Condiciones
                        </h1>
                        <p className="text-gray-400">
                            Última actualización: 24 de enero de 2026
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16 px-4">
                    <div className="max-w-3xl mx-auto prose prose-invert prose-lg">
                        <h2>1. Aceptación de los Términos</h2>
                        <p>
                            Al acceder y utilizar la plataforma Eventu (el &quot;Servicio&quot;),
                            operada por Eventu Colombia SAS (&quot;Eventu&quot;, &quot;nosotros&quot; o &quot;nos&quot;),
                            usted acepta estar sujeto a estos Términos y Condiciones.
                            Si no está de acuerdo con alguna parte de estos términos,
                            no podrá acceder al Servicio.
                        </p>

                        <h2>2. Descripción del Servicio</h2>
                        <p>
                            Eventu es una plataforma de ticketing que permite:
                        </p>
                        <ul>
                            <li>Comprar boletas para eventos</li>
                            <li>Vender boletas como organizador</li>
                            <li>Transferir boletas a otros usuarios</li>
                            <li>Validar boletas mediante tecnología SafeTix</li>
                        </ul>

                        <h2>3. Registro y Cuenta</h2>
                        <p>
                            Para utilizar ciertas funciones del Servicio, debe registrar una cuenta.
                            Usted es responsable de:
                        </p>
                        <ul>
                            <li>Proporcionar información precisa y actualizada</li>
                            <li>Mantener la confidencialidad de su contraseña</li>
                            <li>Todas las actividades que ocurran bajo su cuenta</li>
                        </ul>

                        <h2>4. Compra de Boletas</h2>
                        <p>
                            Al comprar boletas a través de Eventu:
                        </p>
                        <ul>
                            <li>Usted acepta pagar el precio indicado más las tarifas de servicio aplicables</li>
                            <li>Las boletas están sujetas a disponibilidad</li>
                            <li>Los precios pueden variar según demanda (pricing dinámico)</li>
                            <li>Las boletas son personales e intransferibles, excepto mediante la función de transferencia de Eventu</li>
                        </ul>

                        <h2>5. Política de Reembolsos</h2>
                        <p>
                            Las políticas de reembolso varían según el evento. En general:
                        </p>
                        <ul>
                            <li>Los eventos cancelados generan reembolso automático</li>
                            <li>Los eventos reprogramados pueden generar reembolso a solicitud</li>
                            <li>Las compras erróneas no son reembolsables</li>
                        </ul>
                        <p>
                            Consulte nuestra <a href="/refunds" className="text-[#E53935]">Política de Reembolsos</a> para más detalles.
                        </p>

                        <h2>6. SafeTix y Seguridad</h2>
                        <p>
                            Nuestro sistema SafeTix genera códigos QR dinámicos que:
                        </p>
                        <ul>
                            <li>Cambian cada 15 segundos para prevenir fraude</li>
                            <li>Son únicos e intransferibles sin usar nuestra plataforma</li>
                            <li>Pueden requerir conexión a internet para validación</li>
                        </ul>

                        <h2>7. Conducta del Usuario</h2>
                        <p>
                            Usted acepta no:
                        </p>
                        <ul>
                            <li>Revender boletas a precios superiores al permitido</li>
                            <li>Falsificar o manipular boletas o códigos QR</li>
                            <li>Usar bots o scripts automatizados para compras</li>
                            <li>Violar derechos de propiedad intelectual</li>
                            <li>Compartir capturas de pantalla de códigos QR</li>
                        </ul>

                        <h2>8. Propiedad Intelectual</h2>
                        <p>
                            Todo el contenido del Servicio, incluyendo logos, diseños y código,
                            son propiedad de Eventu Colombia SAS y están protegidos por
                            leyes de propiedad intelectual colombianas e internacionales.
                        </p>

                        <h2>9. Limitación de Responsabilidad</h2>
                        <p>
                            Eventu actúa como intermediario entre organizadores y compradores.
                            No somos responsables de:
                        </p>
                        <ul>
                            <li>La realización, calidad o seguridad del evento</li>
                            <li>Cambios de fecha, horario o artistas</li>
                            <li>Daños o lesiones durante el evento</li>
                        </ul>

                        <h2>10. Ley Aplicable</h2>
                        <p>
                            Estos términos se rigen por las leyes de la República de Colombia.
                            Cualquier disputa será resuelta en los tribunales de Barranquilla,
                            Atlántico, Colombia.
                        </p>

                        <h2>11. Modificaciones</h2>
                        <p>
                            Nos reservamos el derecho de modificar estos términos en cualquier momento.
                            Los cambios entrarán en vigor al publicarse en esta página.
                            El uso continuado del Servicio constituye aceptación de los nuevos términos.
                        </p>

                        <h2>12. Contacto</h2>
                        <p>
                            Para preguntas sobre estos términos, contáctenos en:
                        </p>
                        <p>
                            <strong>Eventu Colombia SAS</strong><br />
                            Calle 84 #51-50, Oficina 401<br />
                            Barranquilla, Atlántico, Colombia<br />
                            Email: legal@eventu.co
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
