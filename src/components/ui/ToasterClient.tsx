'use client';
import { Toaster } from 'sonner';
export default function ToasterClient() {
    return (
        <Toaster
            position="top-center"
            theme="light"
            toastOptions={{
                classNames: {
                    success: 'bhcg-success-toast',
                },
            }}
        />
    );
}
