'use client';

import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';
import { AuthProvider } from '../lib/auth/AuthContext';
import { LayoutProvider } from '../layout/context/layoutcontext';

export function Providers({ children }: { children: React.ReactNode }) {
    const value = {
        ripple: true,
        inputStyle: 'outlined' as const,
        appendTo: 'self' as const
    };

    return (
        <PrimeReactProvider value={value}>
            <AuthProvider>
                <LayoutProvider>{children}</LayoutProvider>
            </AuthProvider>
        </PrimeReactProvider>
    );
}
