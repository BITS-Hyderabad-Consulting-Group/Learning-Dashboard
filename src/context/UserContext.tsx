'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js'; // Import Supabase types
import { UserContextType } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation'; // Import useRouter

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
    const router = useRouter(); // Use router for navigation

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                setUser(null);
            } else {
                const authUser = session.user;
                setUser({
                    id: authUser.id,
                    email: authUser.email!,
                    role: 'learner',
                    name:
                        authUser.user_metadata?.full_name ||
                        authUser.user_metadata?.name ||
                        authUser.email?.split('@')[0] ||
                        '',
                });
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
                throw error;
            }
            router.push('/');
        } catch (error) {
            console.error('Error during sign-out:', error);
            throw error;
        }
    };

    const value = {
        user,
        isLoading,
        signInWithGoogle,
        signOut,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
