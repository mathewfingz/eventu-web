import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next');

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // If a specific destination was requested, use it
            if (next) {
                return NextResponse.redirect(`${origin}${next}`);
            }

            // Otherwise, redirect based on user role
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                const role = profile?.role || 'CLIENT';

                // Redirect based on role
                switch (role) {
                    case 'SUPERADMIN':
                        return NextResponse.redirect(`${origin}/admin`);
                    case 'COORDINATOR':
                        return NextResponse.redirect(`${origin}/coordinator`);
                    case 'PROMOTER':
                    case 'ORGANIZER':
                        return NextResponse.redirect(`${origin}/organizer`);
                    default:
                        return NextResponse.redirect(`${origin}/dashboard`);
                }
            }

            // Fallback to dashboard
            return NextResponse.redirect(`${origin}/dashboard`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/error?error=auth_callback_failed`);
}
