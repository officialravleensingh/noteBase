'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import UserDropdown from './UserDropdown';
import { useAuth } from '../hooks/useAuth';

const MainNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const sections = [
    {
      id: 'notes',
      name: 'Notes',
      path: '/dashboard'
    },
    {
      id: 'memories',
      name: 'Memories',
      path: '/memories'
    },
    {
      id: 'journal',
      name: 'Journal',
      path: '/journal'
    }
  ];

  const handleSectionClick = (section) => {
    router.push(section.path);
  };

  const getCurrentSection = () => {
    if (pathname.startsWith('/memories')) return 'memories';
    if (pathname.startsWith('/journal')) return 'journal';
    return 'notes';
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">NoteBase</h1>
          </div>

          <div className="flex items-center space-x-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform
                  ${getCurrentSection() === section.id
                    ? 'text-blue-600 text-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:scale-105 text-sm'
                  }
                `}
              >
                <span>{section.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const currentSection = getCurrentSection();
                router.push(`/recycle-bin?section=${currentSection}`);
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium"
              title="Recycle Bin"
            >
              Recycle Bin
            </button>
            {user && <UserDropdown user={user} onLogout={logout} />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;