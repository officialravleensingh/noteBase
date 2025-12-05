'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '../../components/AuthForm';
import { login as loginAPI } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const response = await loginAPI(credentials);
      login(response.user, response.accessToken, response.refreshToken);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to NoteBase
          </h2>
        </div>
        <AuthForm mode="login" onSubmit={handleLogin} loading={loading} />
        <div className="text-center">
          <Link href="/signup" className="text-blue-600 hover:text-blue-500">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}