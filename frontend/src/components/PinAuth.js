'use client';

import { useState } from 'react';
import PinInput from './PinInput';
import { pinAPI } from '../lib/api';

const PinAuth = ({ section, onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await pinAPI.verifyPin(section, pin);
      onSuccess();
    } catch (error) {
      setError(error.message || 'Invalid PIN');
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
            Access {sectionNames[section]}
          </h2>
          <p className="text-gray-600 mt-2">
            Enter your 4-digit PIN to continue
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter your 4-digit PIN
            </label>
            <PinInput 
              value={pin}
              onChange={setPin}
              autoFocus={true}
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
              disabled={loading || pin.length !== 4}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinAuth;