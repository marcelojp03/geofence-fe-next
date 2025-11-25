'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace('/monitoring');
            } else {
                router.replace('/auth/login');
            }
        }
    }, [user, loading, router]);

    // Show loading while redirecting
    return (
        <div className="flex align-items-center justify-content-center min-h-screen">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        </div>
    );
}
