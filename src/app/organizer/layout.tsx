'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizerSidebar } from '@/components/organizer/sidebar';
import { OrganizerHeader } from '@/components/organizer/header';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface OrganizerLayoutProps {
    children: React.ReactNode;
}

export default function OrganizerLayout({ children }: OrganizerLayoutProps) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<{
        name?: string | null;
        email?: string | null;
    }>({
        name: null,
        email: null
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = getSupabaseBrowserClient();

            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                router.push('/auth/login?callbackUrl=/organizer');
                return;
            }

            // Check if user has organizer role
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', authUser.id)
                .single();

            // For now, allow access but in production you'd check for ORGANIZER role
            // if (profile?.role !== 'ORGANIZER') {
            //     router.push('/dashboard');
            //     return;
            // }

            setUser({
                name: profile?.full_name || authUser.email?.split('@')[0],
                email: authUser.email
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
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <OrganizerSidebar
                user={user}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen lg:min-w-0">
                {/* Header */}
                <OrganizerHeader
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
