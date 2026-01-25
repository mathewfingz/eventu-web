import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for browser/client components
 * Use this in 'use client' components
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Export a singleton instance for convenience
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
    if (!browserClient) {
        browserClient = createClient();
    }
    return browserClient;
}
