'use client';

import { useState, useRef, useEffect } from 'react';

const OtpInput = ({ value, onChange, autoFocus = false }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (autoFocus && inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [autoFocus]);

  const handleChange = (index, newValue) => {
    if (!/^\d*$/.test(newValue)) return;

    const newDigits = [...digits];
    newDigits[index] = newValue.slice(-1);
    setDigits(newDigits);

    const otpValue = newDigits.join('');
    onChange(otpValue);

    if (newValue && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  return (
    <div className="flex justify-center space-x-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={inputRefs[index]}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default OtpInput;