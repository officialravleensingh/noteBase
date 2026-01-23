'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NoteLockModal from './NoteLockModal';
import ExportModal from './ExportModal';
import ActivityLogModal from './ActivityLogModal';

export default function NoteCard({ note, onDelete, onSelect, selectionMode, isSelected, onItemSelect, onNoteUpdate }) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [noteState, setNoteState] = useState(note);

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
    if (noteState.isLocked) {
      setShowLockModal(true);
      return;
    }
    router.push(`/editor/${note.id || note._id}`);
  };

  const handleDelete = () => {
    onDelete(note.id || note._id);
    setShowDeleteConfirm(false);
  };

  const handleLockStatusChange = (isLocked) => {
    const updatedNote = { ...noteState, isLocked };
    setNoteState(updatedNote);
    if (onNoteUpdate) {
      onNoteUpdate(updatedNote);
    }
    if (!isLocked) {
      // If unlocked, redirect to editor
      router.push(`/editor/${note.id || note._id}`);
    }
  };

  const handleLockToggle = (e) => {
    e.stopPropagation();
    setShowLockModal(true);
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
          <span className="text-lg">{getTypeIcon(noteState.type)}</span>
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {noteState.title || 'Untitled'}
          </h3>
          {noteState.isLocked && (
            <span className="text-yellow-600" title="Note is locked">
              🔒
            </span>
          )}
        </div>
        <div className="flex space-x-2 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActivityLog(true);
            }}
            className="text-gray-400 hover:text-orange-600 text-sm"
            title="View activity log"
          >
            Activity
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowExportModal(true);
            }}
            className="text-gray-400 hover:text-green-600 text-sm"
            title="Export note"
          >
            Export
          </button>
          <button
            onClick={handleLockToggle}
            className="text-gray-400 hover:text-yellow-600 text-sm"
            title={noteState.isLocked ? 'Unlock note' : 'Lock note'}
          >
            {noteState.isLocked ? 'Unlock' : 'Lock'}
          </button>
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

      <div className="flex items-center gap-2 mb-2">
        {noteState.type && noteState.type !== 'normal' && (
          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
            {getTypeLabel(noteState.type)}
          </span>
        )}
        {(noteState.folder || noteState.folderId) && (
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
            {noteState.folder?.name || noteState.folderId?.name || 'Folder'}
          </span>
        )}
        {noteState.isLocked && (
          <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
            Locked
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {noteState.isLocked ? 'This note is locked. Click to unlock and view content.' : getPreview(noteState.content)}
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Updated: {formatDate(noteState.updatedAt)}</span>
        <span>{noteState.isLocked ? 'Locked' : `${getWordCount(noteState.content)} words`}</span>
      </div>

      {/* Activity Log Modal */}
      <ActivityLogModal
        noteId={note.id || note._id}
        isOpen={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        onRevert={() => {
          // Refresh note data after revert
          if (onNoteUpdate) {
            // Trigger parent to refresh data
            window.location.reload();
          }
        }}
      />

      {/* Export Modal */}
      <ExportModal
        noteId={note.id || note._id}
        noteTitle={noteState.title}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Lock Modal */}
      <NoteLockModal
        note={noteState}
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        onLockStatusChange={handleLockStatusChange}
      />

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
            <h3 className="text-lg font-semibold mb-4">Move to Recycle Bin?</h3>
            <p className="text-gray-600 mb-6">
              This will move "{noteState.title || 'Untitled'}" to the recycle bin. You can restore it later or delete it permanently.
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
                Move to Bin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}