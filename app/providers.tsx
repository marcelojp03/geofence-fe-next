'use client';

import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from '../lib/auth/AuthContext';
import { LayoutProvider } from '../layout/context/layoutcontext';

export function Providers({ children }: { children: React.ReactNode }) {
    const value = {
        ripple: true,
        inputStyle: 'outlined',
        appendTo: 'self'
    };

    return (
        <PrimeReactProvider value={value}>
            <AuthProvider>
                <LayoutProvider>{children}</LayoutProvider>
            </AuthProvider>
        </PrimeReactProvider>
    );
}
