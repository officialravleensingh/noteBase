'use client';
import { useState } from 'react';
import GoogleAuthButton from './GoogleAuthButton';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

export default function AuthForm({ mode, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: mode === 'signup' ? '' : undefined,
    rememberMe: true
  });
  const [error, setError] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return Object.values(requirements).every(req => req);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const newFormData = { ...formData, [e.target.name]: value };
    setFormData(newFormData);
    
    if (mode === 'signup' && e.target.name === 'password') {
      setPasswordValid(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup' && !passwordValid) {
      setError('Please meet all password requirements');
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (err) {
      if (err.message.includes('Validation failed') && err.details) {
        const firstError = err.details[0];
        setError(firstError.msg || err.message);
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="8"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {mode === 'signup' && formData.password && (
          <PasswordStrengthIndicator password={formData.password} />
        )}
        {mode === 'login' && (
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        )}
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={loading || (mode === 'signup' && !passwordValid)}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          loading || (mode === 'signup' && !passwordValid)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >{loading ? 'Loading...' : mode === 'signup' ? 'Sign Up' : 'Login'}
      </button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>
      
      <GoogleAuthButton />
    </div>
  );
}