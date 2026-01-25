import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';

// DEV: Mock user for development without auth
const DEV_MODE = process.env.NODE_ENV === 'development';
const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true';

const mockUser = {
    id: 'dev-admin-123',
    name: 'Super Admin',
    email: 'admin@eventu.co',
    role: 'SUPERADMIN' as const,
};

export default async function AdminLayout({
    children
}: {
    children: React.ReactNode
}) {
    // In production, this would check for real auth
    // For now, we use mock user in development
    const user = DEV_MODE || BYPASS_AUTH ? mockUser : null;

    if (!user) {
        // In production, redirect to login
        // redirect('/auth/login?error=unauthorized');
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminSidebar user={user || mockUser} />

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader user={user || mockUser} />

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
