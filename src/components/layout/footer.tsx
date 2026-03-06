import Link from 'next/link';
import {
    Instagram,
    Facebook,
    Twitter,
    Music,
    Phone,
    Mail,
    MapPin,
    ArrowUpRight,
} from 'lucide-react';

const footerLinks = {
    events: [
        { label: 'Conciertos', href: '/events?category=concerts' },
        { label: 'Festivales', href: '/events?category=festivals' },
        { label: 'Teatro', href: '/events?category=theater' },
        { label: 'Deportes', href: '/events?category=sports' },
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

const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com/eventu', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com/eventu', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/eventu', label: 'Twitter' },
    { icon: Music, href: 'https://tiktok.com/@eventu', label: 'TikTok' },
];

export function Footer() {
    return (
        <footer className="bg-[#1D1D1F] text-white">
            {/* Main footer content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
                    {/* Brand section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B6B] to-[#E53935] rounded-xl flex items-center justify-center text-white font-bold shadow-[0_4px_12px_rgba(229,57,53,0.3)] group-hover:shadow-[0_4px_20px_rgba(229,57,53,0.5)] transition-shadow">
                                E
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                                Eventu
                            </span>
                        </Link>
                        <p className="text-white/40 text-sm mb-6 max-w-xs leading-relaxed">
                            Tickets a un Click. La plataforma de boletería más segura para los mejores eventos de Colombia.
                        </p>

                        {/* Social links */}
                        <div className="flex gap-2.5">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center hover:bg-white/[0.12] transition-all hover:scale-105"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-[18px] h-[18px] text-white/60" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Events links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-white/90 text-sm uppercase tracking-wider">Eventos</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.events.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-white/40 hover:text-white/80 transition-colors text-sm flex items-center gap-1 group"
                                    >
                                        {link.label}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-white/90 text-sm uppercase tracking-wider">Compañía</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-white/40 hover:text-white/80 transition-colors text-sm flex items-center gap-1 group"
                                    >
                                        {link.label}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-white/90 text-sm uppercase tracking-wider">Ayuda</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.help.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-white/40 hover:text-white/80 transition-colors text-sm flex items-center gap-1 group"
                                    >
                                        {link.label}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-white/90 text-sm uppercase tracking-wider">Legal</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-white/40 hover:text-white/80 transition-colors text-sm flex items-center gap-1 group"
                                    >
                                        {link.label}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Payment methods & contact */}
                <div className="border-t border-white/[0.06] mt-10 pt-8">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <p className="text-xs text-white/30 mb-3 uppercase tracking-wider font-medium">Métodos de pago</p>
                            <div className="flex flex-wrap gap-2">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.name}
                                        className="px-3 py-1.5 bg-white/[0.06] rounded-lg text-xs font-medium text-white/50 border border-white/[0.04]"
                                    >
                                        {method.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-5 text-sm text-white/40">
                            <a href="tel:+573002850000" className="flex items-center gap-2 hover:text-white/70 transition-colors">
                                <Phone className="w-3.5 h-3.5" />
                                (300) 285-0000
                            </a>
                            <a href="mailto:info@eventu.co" className="flex items-center gap-2 hover:text-white/70 transition-colors">
                                <Mail className="w-3.5 h-3.5" />
                                info@eventu.co
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/[0.06] mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-white/30 text-xs">
                        &copy; {new Date().getFullYear()} Eventu. Todos los derechos reservados.
                    </p>
                    <p className="text-white/20 text-xs flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        Barranquilla, Colombia
                    </p>
                </div>
            </div>
        </footer>
    );
}
