import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';

interface RootLayoutProps {
    children: React.ReactNode;
}

export const viewport: Viewport = {
    initialScale: 1,
    width: 'device-width',
    maximumScale: 1
};

export const metadata: Metadata = {
    title: 'Geofence Admin',
    description: 'Geofence Management System',
    icons: {
        icon: '/favicon.ico'
    }
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
