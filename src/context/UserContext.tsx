'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { UserContextType, UserRole } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserContextType['user']>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                setUser(null);
                setIsLoading(false);
                router.push('/');
                return;
            }

            const authUser = session.user;

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                setUser(null);
            } else if (profile) {
                setUser({
                    id: profile.id,
                    email: authUser.email!,
                    role: profile.role as UserRole,
                    xp: profile.xp ?? 0,
                    biodata: profile.biodata,
                    createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
                    updatedAt: profile.updated_at ? new Date(profile.updated_at) : undefined,
                    name: profile.full_name || authUser.email?.split('@')[0] || '',
                });
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    const signInWithGoogle = async () => {
        try {
            const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
                ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
                : '/dashboard';
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo },
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error during sign-out:', error);
        }
    };

    const value = { user, isLoading, signInWithGoogle, signOut };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
