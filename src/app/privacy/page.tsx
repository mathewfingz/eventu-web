import { Shield } from 'lucide-react';
import { Footer } from '@/components/layout/footer';

export const metadata = {
    title: 'Política de Privacidad | Eventu',
    description: 'Política de privacidad y tratamiento de datos personales de Eventu.',
};

export default function PrivacyPage() {
    return (
        <>
            <main className="min-h-screen bg-[#121212] text-white">
                {/* Hero */}
                <section className="relative py-24 px-4 bg-gradient-to-br from-[#E53935]/20 to-transparent">
                    <div className="max-w-4xl mx-auto text-center">
                        <Shield className="w-16 h-16 text-[#E53935] mx-auto mb-6" />
                        <h1 className="text-5xl font-bold mb-6 font-[Poppins,sans-serif]">
                            Política de Privacidad
                        </h1>
                        <p className="text-gray-400">
                            Última actualización: 24 de enero de 2026
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16 px-4">
                    <div className="max-w-3xl mx-auto prose prose-invert prose-lg">
                        <h2>1. Información que Recopilamos</h2>
                        <p>
                            En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013
                            (Régimen de Protección de Datos Personales en Colombia),
                            informamos sobre los datos que recopilamos:
                        </p>

                        <h3>Datos de registro:</h3>
                        <ul>
                            <li>Nombre completo</li>
                            <li>Correo electrónico</li>
                            <li>Número de teléfono</li>
                            <li>Documento de identidad (para verificación)</li>
                        </ul>

                        <h3>Datos de transacciones:</h3>
                        <ul>
                            <li>Historial de compras</li>
                            <li>Métodos de pago utilizados</li>
                            <li>Boletas adquiridas y transferidas</li>
                        </ul>

                        <h3>Datos de uso:</h3>
                        <ul>
                            <li>Dirección IP</li>
                            <li>Tipo de dispositivo y navegador</li>
                            <li>Páginas visitadas y tiempo de permanencia</li>
                            <li>Ubicación aproximada</li>
                        </ul>

                        <h2>2. Uso de la Información</h2>
                        <p>
                            Utilizamos sus datos personales para:
                        </p>
                        <ul>
                            <li>Procesar compras y entregar boletas</li>
                            <li>Verificar identidad y prevenir fraude</li>
                            <li>Enviar confirmaciones y actualizaciones de eventos</li>
                            <li>Mejorar nuestros servicios y experiencia de usuario</li>
                            <li>Cumplir con obligaciones legales y tributarias</li>
                            <li>Enviar comunicaciones de marketing (con su consentimiento)</li>
                        </ul>

                        <h2>3. Compartir Información</h2>
                        <p>
                            Compartimos sus datos únicamente con:
                        </p>
                        <ul>
                            <li><strong>Organizadores de eventos:</strong> Nombre y email para gestión del evento</li>
                            <li><strong>Procesadores de pago:</strong> Datos necesarios para transacciones (Nequi, PSE, pasarelas)</li>
                            <li><strong>Proveedores de servicios:</strong> Hosting, email, analytics (bajo acuerdos de confidencialidad)</li>
                            <li><strong>Autoridades:</strong> Cuando sea requerido por ley</li>
                        </ul>

                        <h2>4. Derechos del Titular</h2>
                        <p>
                            De acuerdo con la ley colombiana, usted tiene derecho a:
                        </p>
                        <ul>
                            <li><strong>Conocer:</strong> Acceder a sus datos personales</li>
                            <li><strong>Actualizar:</strong> Corregir datos inexactos o incompletos</li>
                            <li><strong>Rectificar:</strong> Solicitar corrección de información errónea</li>
                            <li><strong>Suprimir:</strong> Solicitar eliminación de sus datos</li>
                            <li><strong>Revocar:</strong> Retirar su consentimiento para tratamiento</li>
                        </ul>
                        <p>
                            Para ejercer estos derechos, contacte a: <a href="mailto:privacidad@eventu.co" className="text-[#E53935]">privacidad@eventu.co</a>
                        </p>

                        <h2>5. Seguridad de los Datos</h2>
                        <p>
                            Implementamos medidas de seguridad técnicas y administrativas:
                        </p>
                        <ul>
                            <li>Encriptación SSL/TLS para todas las comunicaciones</li>
                            <li>Almacenamiento encriptado de datos sensibles</li>
                            <li>Cumplimiento PCI DSS para datos de pago</li>
                            <li>Acceso restringido a personal autorizado</li>
                            <li>Auditorías de seguridad periódicas</li>
                        </ul>

                        <h2>6. Retención de Datos</h2>
                        <p>
                            Conservamos sus datos personales:
                        </p>
                        <ul>
                            <li>Datos de cuenta: Mientras la cuenta esté activa</li>
                            <li>Datos de transacciones: 10 años (requisitos tributarios colombianos)</li>
                            <li>Datos de marketing: Hasta que revoque su consentimiento</li>
                        </ul>

                        <h2>7. Transferencias Internacionales</h2>
                        <p>
                            Sus datos pueden ser procesados en servidores ubicados fuera de Colombia
                            (principalmente Estados Unidos). Garantizamos que estos proveedores
                            cumplen con estándares de protección adecuados.
                        </p>

                        <h2>8. Menores de Edad</h2>
                        <p>
                            Nuestro servicio no está dirigido a menores de 14 años.
                            Los usuarios entre 14 y 18 años deben contar con autorización
                            de sus padres o tutores legales.
                        </p>

                        <h2>9. Cambios a esta Política</h2>
                        <p>
                            Podemos actualizar esta política periódicamente.
                            Los cambios significativos serán notificados por email
                            o mediante aviso destacado en nuestra plataforma.
                        </p>

                        <h2>10. Contacto</h2>
                        <p>
                            <strong>Responsable del Tratamiento:</strong><br />
                            Eventu Colombia SAS<br />
                            NIT: 901.XXX.XXX-X<br />
                            Calle 84 #51-50, Oficina 401<br />
                            Barranquilla, Atlántico, Colombia<br />
                            Email: <a href="mailto:privacidad@eventu.co" className="text-[#E53935]">privacidad@eventu.co</a><br />
                            Teléfono: +57 300 123 4567
                        </p>

                        <h2>11. Superintendencia de Industria y Comercio</h2>
                        <p>
                            Si considera que sus derechos han sido vulnerados,
                            puede presentar una queja ante la Superintendencia de Industria y Comercio:
                        </p>
                        <p>
                            <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="text-[#E53935]">
                                www.sic.gov.co
                            </a>
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
