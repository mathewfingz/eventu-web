import Link from 'next/link';
import {
    Instagram,
    Facebook,
    Twitter,
    Music,
    Phone,
    Mail
} from 'lucide-react';

const footerLinks = {
    dashboards: [
        { label: 'Mi Dashboard', href: '/dashboard' },
        { label: 'Mis Boletas', href: '/dashboard/tickets' },
        { label: 'Panel Organizador', href: '/organizer/settlements' },
        { label: 'Escáner Coordinador', href: '/coordinator/scanner' },
    ],
    company: [
        { label: 'Nosotros', href: '/about' },
        { label: 'Trabaja con nosotros', href: '/careers' },
        { label: 'Prensa', href: '/press' },
        { label: 'Blog', href: '/blog' },
    ],
    help: [
        { label: 'Preguntas frecuentes', href: '/faq' },
        { label: 'Contacto', href: '/contact' },
        { label: 'Reembolsos', href: '/refunds' },
        { label: 'Chatbot', href: '/chat' },
        { label: 'Por qué confiar', href: '/confiar' },
    ],
    legal: [
        { label: 'Términos y condiciones', href: '/terms' },
        { label: 'Política de privacidad', href: '/privacy' },
        { label: 'Cookies', href: '/cookies' },
    ],
};

const paymentMethods = [
    { name: 'Nequi', color: '#E31C79' },
    { name: 'PSE', color: '#004481' },
    { name: 'Visa', color: '#1A1F71' },
    { name: 'MC', color: '#EB001B' },
    { name: 'Efecty', color: '#FFDD00' },
];

export function Footer() {
    return (
        <footer className="bg-[#212121] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                    {/* Logo and description */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-[#E53935] rounded-lg flex items-center justify-center text-white font-bold">
                                E
                            </div>
                            <span className="text-2xl font-bold font-[Poppins,sans-serif]">
                                Eventu
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-4 max-w-xs">
                            La plataforma de ticketing más segura de Colombia. Compra tus boletas con confianza.
                        </p>

                        {/* Social links */}
                        <div className="flex gap-4">
                            <a
                                href="https://instagram.com/eventu"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://facebook.com/eventu"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com/eventu"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://tiktok.com/@eventu"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                aria-label="TikTok"
                            >
                                <Music className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Dashboards links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-[#E53935]">🎫 Dashboards</h3>
                        <ul className="space-y-2">
                            {footerLinks.dashboards.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company links */}
                    <div>
                        <h3 className="font-semibold mb-4">Compañía</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help links */}
                    <div>
                        <h3 className="font-semibold mb-4">Ayuda</h3>
                        <ul className="space-y-2">
                            {footerLinks.help.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal links */}
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Payment methods */}
                <div className="border-t border-white/10 mt-8 pt-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-400 mb-3">Métodos de pago:</p>
                            <div className="flex flex-wrap gap-2">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.name}
                                        className="px-3 py-1 bg-white/10 rounded text-xs font-medium"
                                    >
                                        {method.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <a href="tel:+573001234567" className="flex items-center gap-2 hover:text-white transition-colors">
                                <Phone className="w-4 h-4" />
                                +57 300 123 4567
                            </a>
                            <a href="mailto:soporte@eventu.co" className="flex items-center gap-2 hover:text-white transition-colors">
                                <Mail className="w-4 h-4" />
                                soporte@eventu.co
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/10 mt-8 pt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} Eventu. Todos los derechos reservados.
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                        Barranquilla, Colombia 🇨🇴
                    </p>
                </div>
            </div>
        </footer>
    );
}
