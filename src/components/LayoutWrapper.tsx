'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

import { Header } from '../components/Header';
import Footer from '../components/Footer';

import { Home, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const PUBLIC_ROUTES = ['/', '/dashboard'];

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading, signInWithGoogle, signOut } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            if (!PUBLIC_ROUTES.includes(pathname)) {
                router.push('/');
            }
        }
    }, [isLoading, user, pathname, router]);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Error signing in with Google:', error);

            alert('Error signing in with Google. Please try again.');
        }
    };

    // const handleSignOut = async () => {
    //     try {
    //         await signOut();
    //     } catch (error) {
    //         console.error('Error signing out:', error);

    //         alert('Error signing out. Please try again.');
    //     }
    // };

    const navItems = [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        user ? { label: 'Profile', path: '/profile', icon: UserIcon } : null,
        !user
            ? {
                  label: 'Login',
                  path: '#',
                  icon: FcGoogle,
                  isButton: true,
                  onClick: handleGoogleSignIn,
              }
            : null,
    ].filter(Boolean) as Array<any>;

    if (isLoading || (!user && !PUBLIC_ROUTES.includes(pathname))) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                navItems={navItems}
                currentPath={pathname}
                onNavigate={(path) => router.push(path)}
            />

            <main className="flex-grow">{children}</main>

            <Footer />
        </div>
    );
};
