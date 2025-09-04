'use client';

import Script from 'next/script';

const Analytics = () => {
    const trackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

    if (!trackingId) {
        return null;
    }

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${trackingId}');
                `}
            </Script>
        </>
    );
};

export default Analytics;
