'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';

// DEV: Mock user for development without auth
const mockUser = {
    id: 'dev-admin-123',
    name: 'Super Admin',
    email: 'admin@eventu.co',
    role: 'SUPERADMIN' as const,
};

export default function AdminLayout({
    children
}: {
    children: React.ReactNode
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // In production, this would check for real auth
    const user = mockUser;

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminSidebar
                user={user}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen lg:min-w-0">
                <AdminHeader
                    user={user}
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
