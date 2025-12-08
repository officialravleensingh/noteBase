'use client';
import { useState } from 'react';

export default function FolderCard({ folder, onDelete, onOpen, selectionMode, isSelected, onSelect }) {
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

  const handleDelete = () => {
    onDelete(folder.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      onClick={selectionMode ? onSelect : () => onOpen(folder.id)}
    >
      {selectionMode && (
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="mr-3"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">📁</span>
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {folder.name}
          </h3>
        </div>
        <div className="flex space-x-2 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="text-gray-400 hover:text-red-600 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        {folder._count?.notes || 0} notes
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Created: {formatDate(folder.createdAt)}</span>
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
            <h3 className="text-lg font-semibold mb-4">Delete Folder</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{folder.name}"? All notes inside this folder will also be permanently deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
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