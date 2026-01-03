'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OTPVerification from '../../components/OTPVerification';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otpCode) => {
    setOtp(otpCode);
    setStep('reset');
  };

  const handleOTPResend = async () => {
    const response = await fetch(`${API_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'password-reset' })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      router.push('/login?message=Password reset successful');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <OTPVerification
        email={email}
        type="password-reset"
        onVerify={handleOTPVerify}
        onResend={handleOTPResend}
        onBack={() => setStep('email')}
      />
    );
  }

  if (step === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Set New Password
            </h2>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
            <div className="space-y-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a code to reset your password
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-500 text-sm text-center"
            >
              ← Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}