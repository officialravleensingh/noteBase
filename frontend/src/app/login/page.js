'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '../../components/AuthForm';
import { login as loginAPI } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
    }
  }, [searchParams]);

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const response = await loginAPI(credentials);
      login(response.user, response.accessToken, response.refreshToken, credentials.rememberMe);
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
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center">
            {message}
          </div>
        )}
        
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

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}