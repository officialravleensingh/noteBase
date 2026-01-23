'use client';
import { useState, useEffect } from 'react';
import { sharingAPI } from '../lib/api';

const ActivityLogModal = ({ noteId, isOpen, onClose, onRevert }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reverting, setReverting] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && noteId) {
      fetchActivityLog();
    }
  }, [isOpen, noteId]);

  const fetchActivityLog = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await sharingAPI.getActivityLog(noteId);
      setLogs(response.logs || []);
    } catch (error) {
      console.error('Failed to fetch activity log:', error);
      setError('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (logId) => {
    try {
      setReverting(logId);
      setError('');
      await sharingAPI.revertChange(logId);
      
      // Update log status locally
      setLogs(logs.map(log => 
        log._id === logId ? { ...log, isReverted: true } : log
      ));
      
      if (onRevert) {
        onRevert();
      }
    } catch (error) {
      console.error('Failed to revert change:', error);
      setError('Failed to revert change');
    } finally {
      setReverting(null);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getChangePreview = (log) => {
    // Strip HTML tags for preview
    const stripHtml = (html) => {
      if (!html) return '';
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    };
    
    if (log.changeType === 'title') {
      return `Title: "${log.oldValue || ''}" → "${log.newValue || ''}"`;
    } else {
      const oldText = stripHtml(log.oldValue || '');
      const newText = stripHtml(log.newValue || '');
      const oldPreview = oldText.length > 50 ? oldText.substring(0, 50) + '...' : oldText;
      const newPreview = newText.length > 50 ? newText.substring(0, 50) + '...' : newText;
      return `Content: "${oldPreview}" → "${newPreview}"`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Collaboration Activity</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading activity...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <button
              onClick={fetchActivityLog}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No collaboration activity yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log._id}
                className={`border rounded-lg p-4 ${
                  log.isReverted ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.changeType === 'title' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {log.changeType === 'title' ? 'Title Change' : 'Content Change'}
                      </span>
                      {log.isReverted && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          Reverted
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {getChangePreview(log)}
                    </p>
                    
                    <div className="text-xs text-gray-500">
                      <span>IP: {log.collaboratorIP}</span>
                      <span className="mx-2">•</span>
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>
                  
                  {!log.isReverted && (
                    <button
                      onClick={() => handleRevert(log._id)}
                      disabled={reverting === log._id}
                      className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {reverting === log._id ? 'Reverting...' : 'Revert'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogModal;