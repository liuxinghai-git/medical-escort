import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
    const { user, role, loading } = useAuth();
    
    // 登录成功后的自动跳转逻辑
    if (!loading && user) {
        if (role === 'admin') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
                    Account Access
                </h1>
                <Auth
                    supabaseClient={supabase}
                    providers={['google']} // 可选：如果你想加 Google 登录
                    appearance={{ theme: ThemeSupa }}
                    theme="light"
                    redirectTo={window.location.origin} // 登录成功后刷新到当前页面，让 AuthContext 处理跳转
                    localization={{
                        variables: {
                            sign_in: {
                                email_label: 'Email Address',
                                password_label: 'Password',
                                button_label: 'Log In to Dashboard',
                                social_provider_text: 'Sign in with {{provider}}',
                                link_text: 'Already have an account? Log In',
                            },
                            sign_up: {
                                email_label: 'Email Address',
                                password_label: 'Create a Password',
                                button_label: 'Create Account',
                                social_provider_text: 'Sign up with {{provider}}',
                                link_text: 'Don\'t have an account? Sign Up',
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
}