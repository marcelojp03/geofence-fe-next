'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // Redirigir automáticamente a Monitoreo
        router.replace('/monitoring');
    }, [router]);

    return (
        <ProtectedRoute>
            <div className="flex align-items-center justify-content-center" style={{ height: '50vh' }}>
                <ProgressSpinner />
            </div>
        </ProtectedRoute>
    );
}
