import './globals.css';

import type { Metadata } from 'next';
import './globals.css';
import { LayoutWrapper } from '../components/LayoutWrapper';
import { UserProvider } from '@/context/UserContext';

export const metadata: Metadata = {
    title: 'BHCG Learning Dashboard',
    description: 'BITS Hyderabad Consulting Group',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <UserProvider>
                    <LayoutWrapper>{children}</LayoutWrapper>
                </UserProvider>
            </body>
        </html>
    );
}
