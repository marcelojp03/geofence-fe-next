/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState, useEffect } from 'react';
import { Checkbox } from 'primereact/checkbox';
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
    const [checked, setChecked] = useState(false);
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
                summary: 'Warning',
                detail: 'Please enter email and password',
                life: 3000
            });
            return;
        }

        setLoading(true);

        try {
            await login({ email, password });
            router.push('/monitoring');
        } catch (err: any) {
            console.error('Login error:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: err.response?.data?.message || 'Invalid email or password',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    return (
        <div className={containerClassName}>
            <Toast ref={toast} />
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <img src="/demo/images/login/avatar.png" alt="Image" height="50" className="mb-3" />
                            <div className="text-900 text-3xl font-medium mb-3">Geofence Admin</div>
                            <span className="text-600 font-medium">Sign in to continue</span>
                        </div>

                        <div>
                            <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">
                                Email
                            </label>
                            <InputText 
                                id="email1" 
                                type="email" 
                                placeholder="Email address" 
                                className="w-full md:w-30rem mb-5" 
                                style={{ padding: '1rem' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                required
                            />

                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>
                            <Password 
                                inputId="password1" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Password" 
                                toggleMask 
                                className="w-full mb-5" 
                                inputClassName="w-full p-3 md:w-30rem"
                                feedback={false}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                required
                            />

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">Remember me</label>
                                </div>
                                <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                    Forgot password?
                                </a>
                            </div>
                            <Button 
                                label={loading ? 'Signing In...' : 'Sign In'} 
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
