'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { recycleBinAPI } from '../../lib/api';
import MainNavigation from '../../components/MainNavigation';

const RecycleBinPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get('section') || 'notes';
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(getSectionFilter(currentSection));
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  function getSectionFilter(section) {
    const sectionMap = {
      'notes': 'note',
      'memories': 'memory', 
      'journal': 'journal',
      'reminders': 'reminder'
    };
    return sectionMap[section] || 'note';
  }

  useEffect(() => {
    fetchItems();
  }, [filter]);

  function getSectionIcon(section) {
    const iconMap = {
      'notes': '📝',
      'memories': '💭',
      'journal': '📔', 
      'reminders': '⏰'
    };
    return iconMap[section] || '📝';
  }

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = { type: filter };
      const response = await recycleBinAPI.getAll(params);
      setItems(response.items || []);
    } catch (error) {
      console.error('Failed to fetch recycle bin items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item) => {
    try {
      await recycleBinAPI.restore(item._id);
      fetchItems();
    } catch (error) {
      console.error('Failed to restore item:', error);
    }
  };

  const handlePermanentDelete = async (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const requestDeleteOTP = async () => {
    try {
      setOtpLoading(true);
      await recycleBinAPI.requestDeleteOTP(selectedItem._id);
    } catch (error) {
      console.error('Failed to request OTP:', error);
    } finally {
      setOtpLoading(false);
    }
  };

  const confirmPermanentDelete = async () => {
    try {
      await recycleBinAPI.permanentDelete(selectedItem._id, otp);
      setShowDeleteModal(false);
      setSelectedItem(null);
      setOtp('');
      fetchItems();
    } catch (error) {
      console.error('Failed to permanently delete item:', error);
    }
  };

  const handleEmptyBin = async () => {
    try {
      setOtpLoading(true);
      await recycleBinAPI.requestEmptyOTP();
      setShowEmptyConfirm(true);
    } catch (error) {
      console.error('Failed to request empty bin OTP:', error);
    } finally {
      setOtpLoading(false);
    }
  };

  const confirmEmptyBin = async () => {
    try {
      await recycleBinAPI.emptyBin(otp);
      setShowEmptyConfirm(false);
      setOtp('');
      fetchItems();
    } catch (error) {
      console.error('Failed to empty recycle bin:', error);
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'note': return '📝';
      case 'folder': return '📁';
      case 'memory': return '💭';
      case 'journal': return '📔';
      default: return '📄';
    }
  };

  const getItemTitle = (item) => {
    return item.originalData.title || item.originalData.name || 'Untitled';
  };

  const filteredItems = items;

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Recycle Bin - {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
              </h1>
              <p className="text-gray-600">Restore or permanently delete {currentSection} items</p>
            </div>
            {items.length > 0 && (
              <button
                onClick={handleEmptyBin}
                disabled={otpLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {otpLoading ? 'Processing...' : 'Empty Bin'}
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs - Only show current section */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <div className="py-2 px-1 border-b-2 border-blue-500 font-medium text-sm flex items-center space-x-2 text-blue-600">
                <span>{getSectionIcon(currentSection)}</span>
                <span>{currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {items.length}
                </span>
              </div>
            </nav>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{getSectionIcon(currentSection)}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {currentSection} in recycle bin
            </h3>
            <p className="text-gray-600">
              Deleted {currentSection} will appear here and be automatically removed after 30 days
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <RecycleBinItem
                  key={item._id}
                  item={item}
                  onRestore={() => handleRestore(item)}
                  onPermanentDelete={() => handlePermanentDelete(item)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Permanent Delete Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Permanent Delete</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to permanently delete "{getItemTitle(selectedItem)}"? 
              This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <button
                onClick={requestDeleteOTP}
                disabled={otpLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-3"
              >
                {otpLoading ? 'Sending OTP...' : 'Send OTP to Email'}
              </button>
              
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Enter 4-digit OTP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmPermanentDelete}
                disabled={otp.length !== 4}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete Forever
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                  setOtp('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Bin Confirmation Modal */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Empty Recycle Bin</h2>
            <p className="text-gray-600 mb-4">
              This will permanently delete all {items.length} items in your recycle bin. 
              This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Enter 4-digit OTP from email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmEmptyBin}
                disabled={otp.length !== 4}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Empty Bin
              </button>
              <button
                onClick={() => {
                  setShowEmptyConfirm(false);
                  setOtp('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Recycle Bin Item Component
const RecycleBinItem = ({ item, onRestore, onPermanentDelete }) => {
  const getItemIcon = (type) => {
    switch (type) {
      case 'note': return '📝';
      case 'folder': return '📁';
      case 'memory': return '💭';
      case 'journal': return '📔';
      default: return '📄';
    }
  };

  const getItemTitle = (item) => {
    return item.originalData.title || item.originalData.name || 'Untitled';
  };

  const getItemPreview = (item) => {
    if (item.originalData.content) {
      return item.originalData.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
    }
    return 'No content preview available';
  };

  const getDaysRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-2xl">{getItemIcon(item.itemType)}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {getItemTitle(item)}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {getItemPreview(item)}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>Deleted {new Date(item.deletedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="text-orange-600">
                Expires in {getDaysRemaining(item.expiresAt)} days
              </span>
              <span>•</span>
              <span className="capitalize">{item.itemType}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onRestore}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            Restore
          </button>
          <button
            onClick={onPermanentDelete}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecycleBinPage;