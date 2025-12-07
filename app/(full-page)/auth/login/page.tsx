/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { useAuth } from '../../../../lib/auth/AuthContext';
import { Toast } from 'primereact/toast';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const { user, login } = useAuth();
    const router = useRouter();
    const toast = React.useRef<Toast>(null);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.replace('/monitoring');
        }
    }, [user, router]);

    const handleSubmit = async () => {
        if (!email || !password) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Ingrese correo y contraseña',
                life: 3000
            });
            return;
        }

        setLoading(true);

        try {
            await login({ email, password });
            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Sesión iniciada correctamente',
                life: 2000
            });
            setTimeout(() => {
                router.push('/monitoring');
            }, 500);
        } catch (err: any) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Correo o contraseña incorrectos';
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    return (
        <div className={containerClassName}>
            <Toast ref={toast} position="top-right" style={{ zIndex: 9999 }} />
            <div className="flex flex-column align-items-center justify-content-center">
                <img src="/icons/geofencing_banner.png" alt="Geofence logo" className="mb-5" style={{ height: '160px' }} />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">Bienvenido</div>
                            <span className="text-600 font-medium">Inicia sesión para continuar</span>
                        </div>

                        <div>
                            <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">
                                Correo Electrónico
                            </label>
                            <InputText 
                                id="email1" 
                                type="email" 
                                placeholder="correo@ejemplo.com" 
                                className="w-full md:w-30rem mb-5" 
                                style={{ padding: '1rem' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                required
                            />

                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                Contraseña
                            </label>
                            <Password 
                                inputId="password1" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Contraseña" 
                                toggleMask 
                                className="w-full mb-5" 
                                inputClassName="w-full p-3 md:w-30rem"
                                feedback={false}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                required
                            />

                            <Button 
                                label={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'} 
                                className="w-full p-3 text-xl" 
                                onClick={handleSubmit}
                                disabled={loading}
                                loading={loading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
