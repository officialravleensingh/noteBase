'use client';
import { useState } from 'react';

export default function CreateNoteModal({ folders, selectedFolder, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('normal');
  const [folderId, setFolderId] = useState(selectedFolder || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const finalFolderId = selectedFolder || (folderId || null);
      
      await onCreate({
        title: title.trim(),
        content: '',
        type,
        folderId: finalFolderId
      });
    } catch (error) {
      console.error('Failed to create note:', error);
      setError(error.message || 'Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Create New Note</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Note Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="noteType"
                  value="normal"
                  checked={type === 'normal'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-3 text-blue-600"
                />
                <span>📝 Normal Note</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="noteType"
                  value="journal"
                  checked={type === 'journal'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-3 text-blue-600"
                />
                <span>📔 Daily Journal</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="noteType"
                  value="memory"
                  checked={type === 'memory'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-3 text-blue-600"
                />
                <span>💭 Memory</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'journal' ? 'Auto-generated with date' : type === 'memory' ? 'Enter memory title (optional)' : 'Enter note title (optional)'}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={type === 'journal'}
              autoFocus={type !== 'journal'}
            />
          </div>

          {!selectedFolder && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder (Optional)
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Folder</option>
                {folders.map(folder => (
                  <option key={folder.id || folder._id} value={folder.id || folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {selectedFolder && (
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Note will be created in: <span className="font-medium">{folders.find(f => (f.id || f._id) === selectedFolder)?.name}</span>
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}