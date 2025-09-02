'use client';

import { supabase } from '@/lib/supabase-client';

export const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${location.origin}/auth/callback`,
        },
    });
};

export const signOut = async () => {
    await supabase.auth.signOut();
};
