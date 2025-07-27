import { supabase } from '@/lib/supabase-client';
import { NextRequest } from 'next/server';

export const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) {
        // handle error if needed
    }
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    window.location.href = '/';
    if (error) {
        // handle error if needed
    }
};

export async function verifyAdminAuth(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Try to read access token from Authorization header as fallback (e.g., fetch with Bearer token)
        let headerToken = null;
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
            headerToken = authHeader.slice(7).trim();
        }

        // Create a server-side Supabase client that automatically reads the auth cookies
        const { createServerClient } = await import('@supabase/ssr');
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set() {},
                remove() {},
            },
        });

        // Fetch the currently authenticated user (based on cookies or Bearer token)
        if (headerToken) {
            // If Bearer token provided, set it temporarily so getUser() works
            await supabase.auth.setSession({
                access_token: headerToken,
                refresh_token: headerToken,
            });
        }
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return { error: 'Authentication required', status: 401 };
        }

        // Import service-role client for privileged queries after user authenticated

        const { supabaseServer } = await import('@/lib/supabase-server');
        // Check if user has admin role using server client
        const { data: profile, error: profileError } = await supabaseServer
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .single();

        if (profileError) {
            return { error: 'Failed to fetch user profile', status: 500 };
        }

        if (profile?.role !== 'admin') {
            return { error: 'Admin access required', status: 403 };
        }

        return {
            success: true,
            user,
            profile,
            supabase: supabaseServer, // Return server client for further operations
        };
    } catch {
        return { error: 'Authentication failed', status: 500 };
    }
}
