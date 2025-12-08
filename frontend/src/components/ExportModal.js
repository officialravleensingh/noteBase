'use client';
import { useState } from 'react';
import { exportAPI } from '../lib/api';

export default function ExportModal({ isOpen, onClose, noteId, noteTitle }) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handlePDFExport = async () => {
    try {
      setLoading(true);
      const blob = await exportAPI.generatePDF(noteId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${noteTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      onClose();
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareLink = async () => {
    try {
      setLoading(true);
      const response = await exportAPI.generateShareLink(noteId);
      setShareUrl(response.shareUrl);
    } catch (error) {
      console.error('Share link generation failed:', error);
      alert('Failed to generate share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Export Note</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Download as PDF</h4>
            <p className="text-sm text-gray-600 mb-3">
              Generate a PDF file with formatted content
            </p>
            <button
              onClick={handlePDFExport}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Create Shareable Link</h4>
            <p className="text-sm text-gray-600 mb-3">
              Generate a public link (expires in 7 days)
            </p>
            
            {!shareUrl ? (
              <button
                onClick={handleShareLink}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? 'Generating Link...' : 'Generate Link'}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-l px-3 py-2 text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-r text-sm"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Link expires in 7 days
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}