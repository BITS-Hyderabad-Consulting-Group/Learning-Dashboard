import './globals.css';

import type { Metadata } from 'next';
import './globals.css';

import LayoutWrapper from '@/components/LayoutWrapper';
import ToasterClient from '@/components/ui/ToasterClient';

export const metadata: Metadata = {
    title: 'Learning Dashboard | BHCG',
    description: 'Learning Dashboard by BITS Hyderabad Consulting Group (BHCG)',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <LayoutWrapper>{children}</LayoutWrapper>
                <ToasterClient />
            </body>
        </html>
    );
}
