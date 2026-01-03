'use client';
import { useState } from 'react';

export default function OTPVerification({ 
  email, 
  type, 
  onVerify, 
  onResend, 
  onBack 
}) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onVerify(otp);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await onResend();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {type === 'signup' ? 'Verify Your Email' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a 6-digit code to <span className="font-medium">{email}</span>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="sr-only">OTP</label>
            <input
              id="otp"
              name="otp"
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
              placeholder="000000"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={onBack}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                ← Back
              </button>
              
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}