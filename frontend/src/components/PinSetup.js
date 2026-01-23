'use client';

import { useState } from 'react';
import PinInput from './PinInput';
import OtpInput from './OtpInput';
import { settingsAPI } from '../lib/api';

const PinSetup = ({ section, onSuccess, onCancel }) => {
  const [step, setStep] = useState(1); // 1: request OTP, 2: verify OTP & set PIN
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sectionNames = {
    memories: 'Memories',
    journal: 'Journal'
  };

  const sectionIcons = {
    memories: '💭',
    journal: '📔'
  };

  const handleRequestOTP = async () => {
    setLoading(true);
    setError('');

    try {
      await settingsAPI.requestPinSetupOTP(section);
      setStep(2);
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

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (confirmPin.length !== 4) {
      setError('Please confirm your 4-digit PIN');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await settingsAPI.verifyPinSetupOTP(section, otp, pin);
      onSuccess();
    } catch (error) {
      setError(error.message || 'Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{sectionIcons[section]}</div>
          <h2 className="text-xl font-semibold text-gray-900">
            Set PIN for {sectionNames[section]}
          </h2>
          <p className="text-gray-600 mt-2">
            {step === 1 
              ? 'We\'ll send a verification code to your email'
              : 'Enter the OTP and create your PIN'
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-6">
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
                onClick={handleRequestOTP}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </div>
        ) : (
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter a 4-digit PIN
              </label>
              <PinInput 
                value={pin}
                onChange={setPin}
                type="password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Confirm your PIN
              </label>
              <PinInput 
                value={confirmPin}
                onChange={setConfirmPin}
                type="password"
              />
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
                disabled={loading || otp.length !== 6 || pin.length !== 4 || confirmPin.length !== 4}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Setting...' : 'Set PIN'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PinSetup;