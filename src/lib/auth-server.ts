import { createSupabaseServerClient } from './supabase/server';

export async function verifyAdminAuth() {
    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return { error: 'Authentication required', status: 401 };
        }

        const { supabaseServer } = await import('@/lib/supabase-server');
        const { data: profile, error: profileError } = await supabaseServer
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .single();

        if (profileError) {
            return { error: 'Failed to fetch user profile', status: 500 };
        }

        if (!(profile?.role === 'admin' || profile?.role === 'instructor')) {
            return { error: 'Admin or instructor access required', status: 403 };
        }

        return { success: true, user, profile, supabase: supabaseServer };
    } catch (e) {
        const errorMessage =
            typeof e === 'object' && e !== null && 'message' in e
                ? (e as { message: string }).message
                : String(e);
        return { error: 'Authentication failed: ' + errorMessage, status: 500 };
    }
}
