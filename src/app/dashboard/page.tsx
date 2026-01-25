import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    Ticket,
    Calendar,
    Heart,
    Settings,
    LogOut,
    User,
    ChevronRight
} from 'lucide-react';



export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    let profile = null;
    let ticketsCount = 5;
    let favoritesCount = 3;

    // Only fetch real data if we have a real user
    if (user) {
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
    }

    const menuItems = [
        {
            icon: Ticket,
            label: 'Mis Boletas',
            href: '/dashboard/tickets',
            count: ticketsCount || 0
        },
        {
            icon: Calendar,
            label: 'Próximos Eventos',
            href: '/dashboard/events',
            count: null
        },
        {
            icon: Heart,
            label: 'Favoritos',
            href: '/dashboard/favorites',
            count: favoritesCount || 0
        },
        {
            icon: Settings,
            label: 'Configuración',
            href: '/dashboard/settings',
            count: null
        },
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#E53935] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                E
                            </div>
                            <span className="text-xl font-bold text-[#E53935] font-[Poppins,sans-serif]">
                                Eventu
                            </span>
                        </Link>

                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="flex items-center gap-2 text-[#757575] hover:text-[#212121] transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Salir</span>
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#E53935]/10 rounded-full flex items-center justify-center">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.full_name || 'Usuario'}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <User className="w-8 h-8 text-[#E53935]" />
                            )}
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-[#212121]">
                                ¡Hola, {profile?.full_name || user.email?.split('@')[0]}!
                            </h1>
                            <p className="text-[#757575]">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E53935]/10 rounded-lg flex items-center justify-center">
                                <Ticket className="w-5 h-5 text-[#E53935]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#212121]">{ticketsCount || 0}</p>
                                <p className="text-sm text-[#757575]">Boletas</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                <Heart className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#212121]">{favoritesCount || 0}</p>
                                <p className="text-sm text-[#757575]">Favoritos</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#FAFAFA] rounded-lg flex items-center justify-center">
                                    <item.icon className="w-5 h-5 text-[#757575]" />
                                </div>
                                <span className="font-medium text-[#212121]">{item.label}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {item.count !== null && (
                                    <span className="text-sm text-[#757575]">{item.count}</span>
                                )}
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Explore Button */}
                <div className="mt-8 text-center">
                    <Link
                        href="/events"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#E53935] text-white rounded-lg font-semibold hover:bg-[#B71C1C] transition-colors"
                    >
                        Explorar eventos
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
