import './globals.css';

import type { Metadata } from 'next';
import './globals.css';

import Analytics from '@/components/Analytics';
import LayoutWrapper from '@/components/LayoutWrapper';
import ToasterClient from '@/components/ui/ToasterClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://learn.bhcg.site';

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: 'Learning Dashboard | BHCG',
        template: `%s | Learning Dashboard | BHCG`,
    },
    description:
        'Explore a comprehensive learning dashboard by BITS Hyderabad Consulting Group (BHCG). Access courses, track progress, and enhance your skills.',
    keywords: [
        'BHCG',
        'BITS Hyderabad Consulting Group',
        'Learning',
        'Courses',
        'Education',
        'Dashboard',
    ],
    authors: [{ name: 'BITS Hyderabad Consulting Group', url: 'https://bhcg.site' }],
    creator: 'BITS Hyderabad Consulting Group',

    openGraph: {
        title: 'Learning Dashboard | BHCG',
        description:
            'Explore a comprehensive learning dashboard by BITS Hyderabad Consulting Group (BHCG). Access courses, track progress, and enhance your skills.',
        url: siteUrl,
        siteName: 'BHCG Learning Dashboard',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'BHCG Learning Dashboard',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Learning Dashboard | BHCG',
        description:
            'Explore a comprehensive learning dashboard by BITS Hyderabad Consulting Group (BHCG). Access courses, track progress, and enhance your skills.',
        images: ['/og-image.png'],
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },

    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <LayoutWrapper>{children}</LayoutWrapper>
                <ToasterClient />
                <Analytics />
            </body>
        </html>
    );
}
