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
    // Debug: log user and profile
    if (typeof window !== 'undefined') {
        console.log('User:', user);
        console.log('Profile:', profile);
    }

    const handleGoogleSignIn = async () => {
        await signInWithGoogle();
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const navItems: NavItem[] = [{ label: 'Home', path: '/', icon: Home }];

    // Only show nav items if profile is loaded
    if (!loading && profile) {
        if (profile.role === 'learner') {
            navItems.push({ label: 'Learning', path: '/learning', icon: LibraryBig });
        } else if (profile.role === 'admin' || profile.role === 'instructor') {
            navItems.push({ label: 'Dashboard', path: '/instructor/dashboard', icon: PencilRuler });
        }
    }

    if (!loading && user) {
        navItems.push({ label: 'Profile', path: '/profile', icon: UserRound });
        navItems.push({ label: 'Logout', path: '#', icon: LogOut, onClick: handleSignOut });
    }

    if (!loading && !user) {
        navItems.push({
            label: 'Login',
            path: '#',
            icon: FcGoogle,
            isButton: true,
            onClick: handleGoogleSignIn,
        });
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
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <PageLayout>{children}</PageLayout>
        </UserProvider>
    );
}
