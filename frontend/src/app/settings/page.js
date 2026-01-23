'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { settingsAPI } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import UserDropdown from '../../components/UserDropdown';
import PinSetup from '../../components/PinSetup';
import PasswordChange from '../../components/PasswordChange';
import ProfileDeletion from '../../components/ProfileDeletion';

const SettingsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteProfile, setShowDeleteProfile] = useState(false);
  const [currentSection, setCurrentSection] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setSettings(response);
      setError('');
    } catch (error) {
      console.error('Settings fetch error:', error);
      setError(`Failed to load settings: ${error.message}`);
      setSettings({
        user: {
          name: user?.name || '',
          email: user?.email || '',
          isGoogleUser: false,
          hasPassword: true
        },
        pins: {
          memories: false,
          journal: false
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'memories', name: 'Memories', icon: '💭', description: 'Store special memories' },
    { id: 'journal', name: 'Journal', icon: '📔', description: 'Daily journal entries' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <UserDropdown />
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          </div>
          <UserDropdown />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Password Change */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Password</h2>
            <p className="text-gray-600 mt-1">Update your account password</p>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Account Password</h3>
                <p className="text-sm text-gray-600">
                  {settings?.user?.hasPassword ? 'Password is set' : 'No password set (OAuth user)'}
                </p>
              </div>
              <button
                onClick={() => setShowPasswordChange(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {settings?.user?.hasPassword ? 'Change Password' : 'Set Password'}
              </button>
            </div>
          </div>
        </div>

        {/* PIN Protection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">PIN Protection</h2>
            <p className="text-gray-600 mt-1">Manage PIN protection for sensitive sections</p>
          </div>
          
          <div className="p-6 space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{section.name}</h3>
                    <p className="text-sm text-gray-600">
                      {settings?.pins?.[section.id] ? 'PIN protection enabled' : 'No PIN protection'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setCurrentSection(section.id);
                    setShowPinSetup(true);
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {settings?.pins?.[section.id] ? 'Change PIN' : 'Set PIN'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
            <p className="text-gray-600 mt-1">Manage your account settings</p>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Delete Profile</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Permanently delete your account and all data
                </p>
              </div>
              <button
                onClick={() => setShowDeleteProfile(true)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPinSetup && (
        <PinSetup
          section={currentSection}
          onSuccess={() => {
            setShowPinSetup(false);
            setSuccess(`${currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} PIN set successfully`);
            setSettings(prev => ({
              ...prev,
              pins: {
                ...prev.pins,
                [currentSection]: true
              }
            }));
            setCurrentSection('');
          }}
          onCancel={() => {
            setShowPinSetup(false);
            setCurrentSection('');
          }}
        />
      )}

      {showPasswordChange && (
        <PasswordChange
          onSuccess={() => {
            setShowPasswordChange(false);
            setSuccess('Password changed successfully');
          }}
          onCancel={() => setShowPasswordChange(false)}
        />
      )}

      {showDeleteProfile && (
        <ProfileDeletion
          onSuccess={(deletionDate) => {
            setShowDeleteProfile(false);
            setSuccess(`Profile deletion scheduled for ${new Date(deletionDate).toDateString()}. You can cancel by logging in within 7 days.`);
          }}
          onCancel={() => setShowDeleteProfile(false)}
        />
      )}
    </div>
  );
};

export default SettingsPage;