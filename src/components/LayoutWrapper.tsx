'use client';

import { usePathname, useRouter } from 'next/navigation';
import { UserProvider, useUser } from '@/context/UserContext';
import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import { signInWithGoogle, signOut } from '../lib/auth';
import { FcGoogle } from 'react-icons/fc';

import { Home, LibraryBig, UserRound, PencilRuler, LogOut } from 'lucide-react';

interface NavItem {
    label: string;
    path: string;
    icon:
        | React.ComponentType<React.SVGProps<SVGSVGElement>>
        | React.FC<{ className?: string; size?: number }>;
    onClick?: () => void | Promise<void>;
    isButton?: boolean;
}

function PageLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, profile, loading } = useUser();

    const handleGoogleSignIn = async () => {
        await signInWithGoogle();
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const navItems = [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Learning', path: '/learning', icon: LibraryBig },

        user && { label: 'Profile', path: '/profile', icon: UserRound },

        profile &&
            (profile.role === 'admin' || profile.role === 'instructor') && {
                label: 'Dashboard',
                path: '/instructor/dashboard',
                icon: PencilRuler,
            },

        user && {
            label: 'Logout',
            path: '#',
            icon: LogOut,
            onClick: handleSignOut,
        },

        !loading && !user
            ? {
                  label: 'Login',
                  path: '#',
                  icon: FcGoogle,
                  isButton: true,
                  onClick: handleGoogleSignIn,
              }
            : null,
    ].filter(Boolean) as NavItem[];

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
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <PageLayout>{children}</PageLayout>
        </UserProvider>
    );
}
