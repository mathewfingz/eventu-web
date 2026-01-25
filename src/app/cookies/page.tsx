'use client';

import { useState } from 'react';
import { Cookie, Check } from 'lucide-react';
import { Footer } from '@/components/layout/footer';

export default function CookiesPage() {
    const [preferences, setPreferences] = useState({
        necessary: true,
        analytics: true,
        marketing: false,
        personalization: true,
    });

    const handleSave = () => {
        localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
        alert('Preferencias guardadas');
    };

    return (
        <>
            <main className="min-h-screen bg-[#121212] text-white">
                {/* Hero */}
                <section className="relative py-24 px-4 bg-gradient-to-br from-[#E53935]/20 to-transparent">
                    <div className="max-w-4xl mx-auto text-center">
                        <Cookie className="w-16 h-16 text-[#E53935] mx-auto mb-6" />
                        <h1 className="text-5xl font-bold mb-6 font-[Poppins,sans-serif]">
                            Política de Cookies
                        </h1>
                        <p className="text-gray-400">
                            Última actualización: 24 de enero de 2026
                        </p>
                    </div>
                </section>

                {/* Preferences */}
                <section className="py-16 px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-[#1E1E1E] rounded-2xl p-8 mb-12">
                            <h2 className="text-2xl font-bold mb-6">Gestionar Preferencias</h2>
                            <div className="space-y-4">
                                <CookieToggle
                                    title="Cookies Necesarias"
                                    description="Esenciales para el funcionamiento del sitio. No se pueden desactivar."
                                    checked={preferences.necessary}
                                    disabled
                                />
                                <CookieToggle
                                    title="Cookies de Análisis"
                                    description="Nos ayudan a entender cómo usas el sitio para mejorarlo."
                                    checked={preferences.analytics}
                                    onChange={(v) => setPreferences({ ...preferences, analytics: v })}
                                />
                                <CookieToggle
                                    title="Cookies de Marketing"
                                    description="Usadas para mostrarte anuncios relevantes."
                                    checked={preferences.marketing}
                                    onChange={(v) => setPreferences({ ...preferences, marketing: v })}
                                />
                                <CookieToggle
                                    title="Cookies de Personalización"
                                    description="Recuerdan tus preferencias para una mejor experiencia."
                                    checked={preferences.personalization}
                                    onChange={(v) => setPreferences({ ...preferences, personalization: v })}
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                className="mt-8 w-full py-4 bg-[#E53935] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors"
                            >
                                Guardar preferencias
                            </button>
                        </div>

                        {/* Content */}
                        <div className="prose prose-invert prose-lg">
                            <h2>¿Qué son las cookies?</h2>
                            <p>
                                Las cookies son pequeños archivos de texto que se almacenan en tu
                                dispositivo cuando visitas un sitio web. Son ampliamente utilizadas
                                para hacer que los sitios web funcionen o funcionen de manera más
                                eficiente, así como para proporcionar información a los propietarios
                                del sitio.
                            </p>

                            <h2>Tipos de Cookies que Usamos</h2>

                            <h3>1. Cookies Necesarias</h3>
                            <p>
                                Estas cookies son esenciales para que puedas navegar por el sitio
                                y usar sus funciones. Sin ellas, no podrías:
                            </p>
                            <ul>
                                <li>Iniciar sesión en tu cuenta</li>
                                <li>Completar una compra</li>
                                <li>Mantener tu sesión activa</li>
                            </ul>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="text-left">Cookie</th>
                                        <th className="text-left">Propósito</th>
                                        <th className="text-left">Duración</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>session_id</td>
                                        <td>Mantener sesión de usuario</td>
                                        <td>Sesión</td>
                                    </tr>
                                    <tr>
                                        <td>csrf_token</td>
                                        <td>Seguridad de formularios</td>
                                        <td>Sesión</td>
                                    </tr>
                                    <tr>
                                        <td>cart</td>
                                        <td>Carrito de compras</td>
                                        <td>30 días</td>
                                    </tr>
                                </tbody>
                            </table>

                            <h3>2. Cookies de Análisis</h3>
                            <p>
                                Nos permiten medir el tráfico y analizar tu comportamiento para
                                mejorar nuestro sitio. Usamos servicios como:
                            </p>
                            <ul>
                                <li>Google Analytics</li>
                                <li>Mixpanel</li>
                                <li>Hotjar (mapas de calor)</li>
                            </ul>

                            <h3>3. Cookies de Marketing</h3>
                            <p>
                                Usadas para rastrear visitantes en sitios web y mostrar anuncios
                                relevantes. Incluyen cookies de:
                            </p>
                            <ul>
                                <li>Meta Pixel (Facebook/Instagram)</li>
                                <li>Google Ads</li>
                                <li>TikTok Pixel</li>
                            </ul>

                            <h3>4. Cookies de Personalización</h3>
                            <p>
                                Recuerdan tus preferencias como:
                            </p>
                            <ul>
                                <li>Idioma preferido</li>
                                <li>Ciudad seleccionada</li>
                                <li>Eventos guardados</li>
                                <li>Preferencias de notificaciones</li>
                            </ul>

                            <h2>Cómo Gestionar las Cookies</h2>
                            <p>
                                Además de usar nuestro panel de preferencias arriba, puedes
                                gestionar las cookies desde tu navegador:
                            </p>
                            <ul>
                                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#E53935]">Chrome</a></li>
                                <li><a href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-" target="_blank" rel="noopener noreferrer" className="text-[#E53935]">Firefox</a></li>
                                <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#E53935]">Safari</a></li>
                                <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[#E53935]">Edge</a></li>
                            </ul>

                            <h2>Actualizaciones</h2>
                            <p>
                                Podemos actualizar esta política cuando sea necesario.
                                Te notificaremos sobre cambios significativos.
                            </p>

                            <h2>Contacto</h2>
                            <p>
                                Para preguntas sobre cookies, escríbenos a:{' '}
                                <a href="mailto:privacidad@eventu.co" className="text-[#E53935]">privacidad@eventu.co</a>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

function CookieToggle({
    title,
    description,
    checked,
    onChange,
    disabled,
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange?: (value: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-4 p-4 bg-[#212121] rounded-xl">
            <div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            <button
                onClick={() => onChange?.(!checked)}
                disabled={disabled}
                className={`
          relative w-14 h-8 rounded-full transition-colors flex-shrink-0
          ${checked ? 'bg-[#E53935]' : 'bg-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
            >
                <span
                    className={`
            absolute top-1 w-6 h-6 rounded-full bg-white transition-transform
            ${checked ? 'left-7' : 'left-1'}
          `}
                />
            </button>
        </div>
    );
}
