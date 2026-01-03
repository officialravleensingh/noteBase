'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NoteCard({ note, onDelete, onSelect, selectionMode, isSelected, onItemSelect }) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'journal': return '📔';
      case 'memory': return '💭';
      default: return '📝';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'journal': return 'Journal';
      case 'memory': return 'Memory';
      default: return 'Note';
    }
  };

  const getWordCount = (content) => {
    if (!content) return 0;
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getPreview = (content) => {
    if (!content) return 'No content';
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  const handleEdit = () => {
    router.push(`/editor/${note.id || note._id}`);
  };

  const handleDelete = () => {
    onDelete(note.id || note._id);
    setShowDeleteConfirm(false);
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      onClick={selectionMode ? onItemSelect : (onSelect || handleEdit)}
    >
      {selectionMode && (
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onItemSelect}
            className="mr-3"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeIcon(note.type)}</span>
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {note.title || 'Untitled'}
          </h3>
        </div>
        <div className="flex space-x-2 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="text-gray-400 hover:text-red-600 text-sm"
          >Delete
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        {note.type && note.type !== 'normal' && (
          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
            {getTypeLabel(note.type)}
          </span>
        )}
        {(note.folder || note.folderId) && (
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
            {note.folder?.name || note.folderId?.name || 'Folder'}
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {getPreview(note.content)}
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Updated: {formatDate(note.updatedAt)}</span>
        <span>{getWordCount(note.content)} words</span>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(false);
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Delete Note</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{note.title || 'Untitled'}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}