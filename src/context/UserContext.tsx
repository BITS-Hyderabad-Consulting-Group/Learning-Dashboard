'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserContextType, UserRole } from '@/types/auth';
import { supabase } from '@/lib/supabase';

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

    useEffect(() => {
        // Check for initial session
        const checkUser = async () => {
            try {
                const { data: authData, error: authError } = await supabase.auth.getUser();

                if (authError) {
                    console.error('Auth error:', authError);
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                const authUser = authData.user;
                console.log('Auth user:', authUser); // Debug log

                if (authUser) {
                    // Fetch user role from your users table
                    const { data: userData, error: dbError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', authUser.id)
                        .single();

                    console.log('User data:', userData); // Debug log
                    console.log('DB error:', dbError); // Debug log

                    if (dbError) {
                        if (dbError.code === 'PGRST116') {
                            // User doesn't exist, create new user
                            const { data: newUser, error: createError } = await supabase
                                .from('profiles')
                                .insert([
                                    {
                                        id: authUser.id,
                                        full_name: authUser.user_metadata?.full_name || '',
                                        role: 'learner', // Default role
                                        auth_user_id: authUser.id,
                                    },
                                ])
                                .select()
                                .single();

                            if (createError) {
                                console.error('Error creating user:', createError);
                                setUser(null);
                            } else {
                                console.log('Created new user:', newUser); // Debug log
                                setUser({
                                    id: authUser.id,
                                    email: authUser.email!,
                                    role: newUser.role as UserRole,
                                    full_name: newUser.full_name, // Updated to use full_name directly
                                });
                            }
                        } else {
                            console.error('Error fetching user:', dbError);
                            setUser(null);
                        }
                    } else if (userData) {
                        setUser({
                            id: authUser.id,
                            email: authUser.email!,
                            role: userData.role as UserRole,
                            full_name: userData.full_name, // Updated to use full_name directly
                        });
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();

        // Set up auth state change listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
                if (session?.user) {
                    console.log('Auth state change - session:', session); // Debug log

                    // Try to fetch existing user
                    const { data: userData, error: fetchError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    console.log('Fetch result:', { userData, fetchError }); // Debug log

                    if (fetchError) {
                        if (fetchError.code === 'PGRST116') {
                            // User doesn't exist, create new user
                            const { data: newUser, error: createError } = await supabase
                                .from('profiles')
                                .insert([
                                    {
                                        id: session.user.id,
                                        full_name: session.user.user_metadata?.full_name || '',
                                        role: 'learner', // Default role
                                        auth_user_id: session.user.id,
                                    },
                                ])
                                .select()
                                .single();

                            console.log('Create result:', { newUser, createError }); // Debug log

                            if (createError) {
                                console.error('Error creating user:', createError);
                                setUser(null);
                            } else {
                                setUser({
                                    id: session.user.id,
                                    email: session.user.email!,
                                    role: newUser.role as UserRole,
                                    full_name: newUser.full_name, // Updated to use full_name directly
                                });
                            }
                        } else {
                            console.error('Error fetching user:', fetchError);
                            setUser(null);
                        }
                    } else if (userData) {
                        setUser({
                            id: session.user.id,
                            email: session.user.email!,
                            role: userData.role as UserRole,
                            full_name: userData.full_name, // Updated to use full_name directly
                        });
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Unexpected error in auth state change:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
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

            // The actual user creation in the users table will happen in the onAuthStateChange
            // when the OAuth redirect completes
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
                alert('Error signing out. Please try again.');
                throw error;
            } else {
                setUser(null); // Clear user state
                window.location.href = '/'; // Redirect to home
            }
        } catch (error) {
            console.error('Unexpected error during sign-out:', error);
            alert('An unexpected error occurred. Please try again.');
            throw error;
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                isLoading,
                signInWithGoogle,
                signOut,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
