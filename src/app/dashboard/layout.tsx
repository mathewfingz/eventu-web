'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<{
        name?: string | null;
        email?: string | null;
        avatar_url?: string | null;
    }>({
        name: null,
        email: null,
        avatar_url: null
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = getSupabaseBrowserClient();

            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                router.push('/auth/login?callbackUrl=/dashboard');
                return;
            }

            // Get profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', authUser.id)
                .single();

            setUser({
                name: profile?.full_name || authUser.email?.split('@')[0],
                email: authUser.email,
                avatar_url: profile?.avatar_url
            });

            setIsLoading(false);
        };

        fetchUser();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#E53935] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex">
            {/* Sidebar */}
            <DashboardSidebar
                user={user}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen lg:min-w-0">
                {/* Header */}
                <DashboardHeader
                    user={user}
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
