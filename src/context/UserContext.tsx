'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase-client';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types/user';

type UserContextType = {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Development mode: if running on localhost, set a random admin user and profile
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            const devUser: User = {
                id: 'dev-admin-id',
                aud: 'authenticated',
                email: 'admin@localhost.dev',
                phone: undefined,
                app_metadata: {},
                user_metadata: {},
                created_at: new Date().toISOString(),
                confirmed_at: new Date().toISOString(),
                last_sign_in_at: new Date().toISOString(),
                role: 'authenticated',
                updated_at: new Date().toISOString(),
            };
            const devProfile: Profile = {
                id: 'dev-admin-id',
                full_name: 'Dev Admin',
                role: 'admin',
                updated_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                xp: 9999,
                email: 'admin@localhost.dev',
                biodata: 'Development administrator',
                photo_url: '',
            };
            setSession(null);
            setUser(devUser);
            setProfile(devProfile);
            setLoading(false);
            return;
        }

        const fetchProfileWithRetry = async (
            userId: string,
            retries = 2
        ): Promise<Profile | null> => {
            for (let attempt = 0; attempt <= retries; attempt++) {
                try {
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .maybeSingle();
                    if (profileError) {
                        console.error('Profile fetch error:', profileError.message);
                        if (attempt === retries) return null;
                    } else {
                        return profileData;
                    }
                } catch (err) {
                    console.error('Profile fetch exception:', err);
                    if (attempt === retries) return null;
                }
            }
            return null;
        };

        const getSessionAndProfile = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const profileData = await fetchProfileWithRetry(session.user.id);
                    setProfile(profileData);
                }
            } catch (err) {
                console.error('Session/profile fetch exception:', err);
            }
            setLoading(false);
        };

        getSessionAndProfile();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                let profileData: Profile | null = null;
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    if (error) {
                        console.error('Profile fetch error (authListener):', error.message);
                        profileData = null;
                    } else {
                        profileData = data;
                    }
                } catch (err) {
                    console.error('Profile fetch exception (authListener):', err);
                    profileData = null;
                }
                setProfile(profileData);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const value = {
        session,
        user,
        profile,
        loading,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
