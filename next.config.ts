import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/k/:path*',
                headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
            },
        ];
    },
};

export default nextConfig;
