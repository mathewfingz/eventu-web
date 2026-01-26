import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    Ticket,
    Calendar,
    Heart,
    Settings,
    User,
    ChevronRight,
    TrendingUp
} from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?callbackUrl=/dashboard');
    }

    let profile = null;
    let ticketsCount = 0;
    let favoritesCount = 0;

    // Get user profile
    const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileData) profile = profileData;

    // Get user's tickets count
    const { count: tickets } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    ticketsCount = tickets || 0;

    // Get user's favorites count
    const { count: favorites } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    favoritesCount = favorites || 0;

    const menuItems = [
        {
            icon: Ticket,
            label: 'Mis Boletas',
            description: 'Ver todas tus boletas compradas',
            href: '/dashboard/tickets',
            count: ticketsCount,
            color: 'bg-[#E53935]/10 text-[#E53935]'
        },
        {
            icon: Calendar,
            label: 'Próximos Eventos',
            description: 'Eventos a los que asistirás',
            href: '/dashboard/events',
            count: null,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            icon: Heart,
            label: 'Favoritos',
            description: 'Eventos que has guardado',
            href: '/dashboard/favorites',
            count: favoritesCount,
            color: 'bg-pink-100 text-pink-600'
        },
        {
            icon: Settings,
            label: 'Configuración',
            description: 'Ajustes de tu cuenta',
            href: '/dashboard/settings',
            count: null,
            color: 'bg-gray-100 text-gray-600'
        },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-[#E53935] to-[#B71C1C] rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={profile.full_name || 'Usuario'}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <User className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold">
                            ¡Hola, {profile?.full_name || user.email?.split('@')[0]}!
                        </h1>
                        <p className="text-white/80 text-sm lg:text-base">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E53935]/10 rounded-lg flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-[#E53935]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#212121]">{ticketsCount}</p>
                            <p className="text-xs lg:text-sm text-[#757575]">Boletas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#212121]">{favoritesCount}</p>
                            <p className="text-xs lg:text-sm text-[#757575]">Favoritos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <h2 className="px-4 pt-4 pb-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Menú rápido
                </h2>
                <div className="divide-y divide-gray-100">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="font-medium text-[#212121] block">{item.label}</span>
                                    <span className="text-xs text-gray-500 hidden sm:block">{item.description}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {item.count !== null && item.count > 0 && (
                                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                        {item.count}
                                    </span>
                                )}
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Discover Events */}
            <div className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Descubre nuevos eventos</h3>
                        <p className="text-gray-400 text-sm">Encuentra los mejores eventos cerca de ti</p>
                    </div>
                    <Link
                        href="/events"
                        className="flex items-center gap-2 px-4 py-2 bg-[#E53935] rounded-lg font-medium hover:bg-[#B71C1C] transition-colors text-sm"
                    >
                        <TrendingUp className="w-4 h-4" />
                        <span className="hidden sm:inline">Explorar</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
