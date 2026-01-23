'use client';

import { useState, useRef, useEffect } from 'react';

const PinInput = ({ value, onChange, autoFocus = false, type = 'text' }) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (autoFocus && inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [autoFocus]);

  const handleChange = (index, newValue) => {
    // Only allow digits
    if (!/^\d*$/.test(newValue)) return;

    const newDigits = [...digits];
    newDigits[index] = newValue.slice(-1); // Only take the last digit
    setDigits(newDigits);

    // Update parent component
    const pinValue = newDigits.join('');
    onChange(pinValue);

    // Auto-focus next input
    if (newValue && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4).split('');
    
    if (digits.length > 0) {
      const newDigits = ['', '', '', ''];
      digits.forEach((digit, index) => {
        if (index < 4) newDigits[index] = digit;
      });
      setDigits(newDigits);
      onChange(newDigits.join(''));
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(digits.length, 3);
      inputRefs[nextIndex].current?.focus();
    }
  };

  return (
    <div className="flex justify-center space-x-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={inputRefs[index]}
          type={type === 'password' ? 'password' : 'text'}
          inputMode="numeric"
          pattern="\d*"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default PinInput;