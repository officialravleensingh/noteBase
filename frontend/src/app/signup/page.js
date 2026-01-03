'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '../../components/AuthForm';
import OTPVerification from '../../components/OTPVerification';
import { useAuth } from '../../hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('signup'); 
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSignup = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setEmail(userData.email);
      setStep('otp');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    login(data.user, data.accessToken, data.refreshToken);
    router.push('/dashboard');
  };

  const handleOTPResend = async () => {
    const response = await fetch(`${API_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'signup' })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
  };

  if (step === 'otp') {
    return (
      <OTPVerification
        email={email}
        type="signup"
        onVerify={handleOTPVerify}
        onResend={handleOTPResend}
        onBack={() => setStep('signup')}
      />
    );
  }

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