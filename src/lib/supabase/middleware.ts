import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Supabase middleware for session management
 * This ensures auth tokens are refreshed and session is maintained
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Don't use getSession() here as it's susceptible to replay attacks
    // Use getUser() for proper validation with the Supabase Auth server
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Define protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/checkout', '/tickets', '/organizer', '/admin'];
    const authRoutes = ['/auth/login', '/auth/register'];

    const isProtectedRoute = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    const isAuthRoute = authRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    // Bypass auth in development if enabled
    const bypassAuth = process.env.BYPASS_AUTH === 'true';

    // Redirect unauthenticated users from protected routes
    if (!user && isProtectedRoute && !bypassAuth) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        url.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    if (user && isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
