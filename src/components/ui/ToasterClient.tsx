'use client';
import { Toaster } from 'react-hot-toast';
export default function ToasterClient() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                success: {
                    iconTheme: {
                        primary: '#007C6A',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
}
