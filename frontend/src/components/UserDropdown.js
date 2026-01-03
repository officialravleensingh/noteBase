'use client';
import { useState, useRef, useEffect } from 'react';

export default function UserDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {getInitials(user.name)}
        </div>
        <span className="hidden sm:block">{user.name}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
          <button
            onClick={() => {
              setIsOpen(false);
              // TODO: Add profile functionality
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Profile
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              // TODO: Add settings functionality
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Settings
          </button>
          <hr className="my-1" />
          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}