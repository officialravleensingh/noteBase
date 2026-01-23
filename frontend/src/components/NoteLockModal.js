'use client';
import { useState } from 'react';
import { notesAPI } from '../lib/api';

export default function NoteLockModal({ note, isOpen, onClose, onLockStatusChange }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
  };

  const handleLockNote = async () => {
    if (pin.length !== 4) {
      alert('PIN must be exactly 4 digits');
      return;
    }

    setLoading(true);
    try {
      await notesAPI.lock(note._id, pin);
      onLockStatusChange(true);
      onClose();
      setPin('');
    } catch (error) {
      alert(error.message || 'Failed to lock note');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockNote = async () => {
    if (pin.length !== 4) {
      alert('PIN must be exactly 4 digits');
      return;
    }

    setLoading(true);
    try {
      await notesAPI.unlock(note._id, pin);
      onLockStatusChange(false);
      onClose();
      setPin('');
    } catch (error) {
      alert(error.message || 'Failed to unlock note');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPin = async () => {
    setLoading(true);
    try {
      await notesAPI.requestUnlockOTP(note._id);
      setShowOTPModal(true);
      alert('OTP sent to your email');
    } catch (error) {
      alert(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      alert('OTP must be 6 digits');
      return;
    }

    setOtpLoading(true);
    try {
      await notesAPI.verifyUnlockOTP(note._id, otp);
      onLockStatusChange(false);
      setShowOTPModal(false);
      onClose();
      setPin('');
      setOtp('');
    } catch (error) {
      alert(error.message || 'Failed to verify OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {note?.isLocked ? 'Unlock Note' : 'Lock Note'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 mb-4">
              {note?.isLocked 
                ? 'Enter your 4-digit PIN to unlock this note'
                : 'Set a 4-digit PIN to lock this note'
              }
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                4-Digit PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={handlePinChange}
                placeholder="0000"
                maxLength="4"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {note?.isLocked && (
              <button
                onClick={handleForgotPin}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Forgot PIN? Get OTP via email
              </button>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={note?.isLocked ? handleUnlockNote : handleLockNote}
              disabled={loading || pin.length !== 4}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (note?.isLocked ? 'Unlock' : 'Lock')}
            </button>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Verify OTP</h2>
              <button
                onClick={() => setShowOTPModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Enter the 6-digit OTP sent to your email
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowOTPModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={otpLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={otpLoading || otp.length !== 6}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {otpLoading ? 'Verifying...' : 'Verify & Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}