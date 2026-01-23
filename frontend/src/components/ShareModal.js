'use client';
import { useState } from 'react';
import { sharingAPI } from '../lib/api';

const ShareModal = ({ noteId, isOpen, onClose }) => {
  const [shareData, setShareData] = useState(null);
  const [permissions, setPermissions] = useState('view');
  const [expiresIn, setExpiresIn] = useState(7);
  const [customExpiry, setCustomExpiry] = useState(false);
  const [customDays, setCustomDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async () => {
    try {
      setLoading(true);
      const expirationDays = customExpiry ? parseInt(customDays) || 7 : expiresIn;
      const result = await sharingAPI.createShareLink(noteId, {
        permissions,
        expiresIn: expirationDays
      });
      setShareData(result);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Silent fail
    }
  };

  const handleClose = () => {
    setShareData(null);
    setCopied(false);
    setCustomExpiry(false);
    setCustomDays('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Share Note</h2>
        
        {!shareData ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Permissions</label>
              <select 
                value={permissions} 
                onChange={(e) => setPermissions(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="view">View Only</option>
                <option value="edit">Can Edit</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Expires In</label>
              <div className="space-y-2">
                <select 
                  value={customExpiry ? 'custom' : expiresIn} 
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setCustomExpiry(true);
                    } else {
                      setCustomExpiry(false);
                      setExpiresIn(Number(e.target.value));
                    }
                  }}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>1 Week</option>
                  <option value={14}>2 Weeks</option>
                  <option value={30}>1 Month</option>
                  <option value={90}>3 Months</option>
                  <option value={365}>1 Year</option>
                  <option value="custom">Custom</option>
                </select>
                
                {customExpiry && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        placeholder="Enter days"
                        min="1"
                        max="3650"
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">days</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {customDays && customDays >= 1 && customDays <= 3650 ? (
                        <span className="text-green-600">
                          Expires: {new Date(Date.now() + parseInt(customDays) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-red-500">
                          Enter a value between 1 and 3650 days (up to 10 years)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleCreateShare}
                disabled={loading || (customExpiry && (!customDays || customDays < 1))}
                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Share Link'}
              </button>
              <button 
                onClick={handleClose}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Share URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={shareData.shareUrl} 
                  readOnly 
                  className="flex-1 p-2 border rounded bg-gray-50 text-sm"
                />
                <button 
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded text-white ${
                    copied ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Permissions:</strong> {shareData.permissions === 'view' ? 'View Only' : 'Can Edit'}</p>
              <p><strong>Expires:</strong> {new Date(shareData.expiresAt).toLocaleDateString()}</p>
            </div>
            
            <button 
              onClick={handleClose}
              className="w-full py-2 border rounded hover:bg-gray-50"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;