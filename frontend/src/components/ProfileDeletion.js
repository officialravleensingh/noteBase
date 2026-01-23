'use client';

import { useState } from 'react';
import OtpInput from './OtpInput';
import { settingsAPI } from '../lib/api';

const ProfileDeletion = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState(1); // 1: warning, 2: request OTP, 3: verify OTP
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async () => {
    setLoading(true);
    setError('');

    try {
      await settingsAPI.requestProfileDeletionOTP();
      setStep(3);
    } catch (error) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await settingsAPI.verifyProfileDeletionOTP(otp);
      onSuccess(result.deletionDate);
    } catch (error) {
      setError(error.message || 'Failed to schedule deletion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 1 ? 'Delete Profile' : step === 2 ? 'Confirm Deletion' : 'Verify OTP'}
          </h2>
          <p className="text-gray-600 mt-2">
            {step === 1 && 'This action will permanently delete your profile and all data'}
            {step === 2 && 'We\'ll send a verification code to your email'}
            {step === 3 && 'Enter the OTP to schedule profile deletion'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Information</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Your profile will be scheduled for deletion in 7 days</li>
                <li>• All your notes, folders, and data will be permanently deleted</li>
                <li>• You can cancel deletion by logging in within 7 days</li>
                <li>• This action requires email verification</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                Are you sure you want to delete your profile? This will schedule your account for permanent deletion in 7 days.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter 6-digit OTP
              </label>
              <OtpInput 
                value={otp}
                onChange={setOtp}
                autoFocus={true}
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                <strong>Final Warning:</strong> Confirming will schedule your profile for deletion in 7 days. You can still cancel by logging in within this period.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule Deletion'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileDeletion;