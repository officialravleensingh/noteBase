'use client';
import { useState, useEffect } from 'react';
import { exportAPI } from '../../../lib/api';

export default function SharedNotePage({ params }) {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSharedNote();
  }, [params.shareId]);

  const fetchSharedNote = async () => {
    try {
      const response = await exportAPI.getSharedNote(params.shareId);
      setNote(response.note);
    } catch (error) {
      setError('Note not found or expired');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading shared note...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Note Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Shared Note</h1>
              <p className="text-sm text-gray-600">
                Shared by {note.user.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">{note.title}</h1>
            {note.folder && (
              <p className="text-sm text-gray-600 mt-2">
                Folder: {note.folder.name}
              </p>
            )}
          </div>
          
          <div className="p-6">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}