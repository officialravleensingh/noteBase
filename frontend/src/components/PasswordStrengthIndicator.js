'use client';
import { useState, useEffect } from 'react';

export default function PasswordStrengthIndicator({ password }) {
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    setRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  const RequirementItem = ({ met, text }) => (
    <div className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-red-500'}`}>
      <span className="mr-2">{met ? '✓' : '✗'}</span>
      {text}
    </div>
  );

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-md">
      <div className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</div>
      <div className="space-y-1">
        <RequirementItem met={requirements.length} text="At least 8 characters" />
        <RequirementItem met={requirements.uppercase} text="One uppercase letter" />
        <RequirementItem met={requirements.lowercase} text="One lowercase letter" />
        <RequirementItem met={requirements.number} text="One number" />
        <RequirementItem met={requirements.special} text="One special character" />
      </div>
    </div>
  );
}