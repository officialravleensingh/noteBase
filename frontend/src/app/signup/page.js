'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '../../components/AuthForm';
import { authAPI } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSignup = async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.signup(userData);
      login(response.token, response.user);
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
            Create your NoteBase account
          </h2>
        </div>
        
        <AuthForm mode="signup" onSubmit={handleSignup} loading={loading} />
        
        <div className="text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}