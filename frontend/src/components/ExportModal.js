'use client';
import { useState } from 'react';
import { exportAPI } from '../lib/api';

const ExportModal = ({ noteId, noteTitle, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePDFExport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await exportAPI.exportToPDF(noteId);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(noteTitle || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        onClose();
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      setError(error.message || 'Failed to export PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Export as PDF</h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Download "{noteTitle || 'Untitled'}" as a PDF file.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handlePDFExport}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button 
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;