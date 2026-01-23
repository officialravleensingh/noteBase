'use client';
import { useState, useEffect, useRef } from 'react';
import { sharingAPI } from '../../../lib/api';

export default function SharedNotePage({ params }) {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchSharedNote();
  }, [params.shareId]);

  const fetchSharedNote = async () => {
    try {
      const response = await sharingAPI.getSharedNote(params.shareId);
      setShareData(response);
      setTitle(response.note.title);
      setContent(response.note.content);
      
      if (contentRef.current) {
        contentRef.current.innerHTML = response.note.content || '';
      }
    } catch (error) {
      setError('Note not found or expired');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (shareData.permissions !== 'edit') return;
    
    try {
      setSaving(true);
      await sharingAPI.updateSharedNote(params.shareId, {
        title: title.trim() || 'Untitled',
        content
      });
    } catch (error) {
      // Silent fail
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (e) => {
    if (shareData.permissions !== 'edit') return;
    setContent(e.target.innerHTML);
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

  const canEdit = shareData.permissions === 'edit';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Shared Note</h1>
              <p className="text-sm text-gray-600">
                {canEdit ? 'You can edit this note' : 'View-only access'}
              </p>
            </div>
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            {canEdit ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold w-full border-none outline-none"
                placeholder="Note title..."
              />
            ) : (
              <h1 className="text-2xl font-bold">{shareData.note.title}</h1>
            )}
            <div className="mt-2 text-sm text-gray-600">
              <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                {shareData.note.type === 'normal' ? '📝' : shareData.note.type === 'journal' ? '📔' : '💭'} 
                {shareData.note.type.charAt(0).toUpperCase() + shareData.note.type.slice(1)}
              </span>
              <span>Created: {new Date(shareData.note.createdAt).toLocaleDateString()}</span>
              <span className="ml-4">Updated: {new Date(shareData.note.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="p-6">
            {canEdit ? (
              <div
                ref={contentRef}
                contentEditable
                onInput={handleContentChange}
                className="min-h-96 outline-none leading-relaxed text-base"
                style={{ 
                  direction: 'ltr',
                  textAlign: 'left',
                  wordWrap: 'break-word'
                }}
                suppressContentEditableWarning={true}
              />
            ) : (
              <div 
                className="prose max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: shareData.note.content }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}