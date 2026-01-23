'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { memoriesAPI, pinAPI } from '../../lib/api';
import MainNavigation from '../../components/MainNavigation';
import PinAuth from '../../components/PinAuth';
import PinSetup from '../../components/PinSetup';

const MemoriesPage = () => {
  const router = useRouter();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // PIN states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinAuth, setShowPinAuth] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [checkingPin, setCheckingPin] = useState(true);

  useEffect(() => {
    checkPinStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMemories();
    }
  }, [isAuthenticated, searchQuery]);

  const checkPinStatus = async () => {
    try {
      const response = await pinAPI.checkPin('memories');
      if (response.hasPin) {
        setShowPinAuth(true);
      } else {
        setShowPinSetup(true);
      }
    } catch (error) {
      console.error('Failed to check PIN status:', error);
      router.push('/dashboard');
    } finally {
      setCheckingPin(false);
    }
  };

  const handlePinSuccess = () => {
    setIsAuthenticated(true);
    setShowPinAuth(false);
    setShowPinSetup(false);
  };

  const handlePinCancel = () => {
    router.push('/dashboard');
  };

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await memoriesAPI.getAll({
        type: 'special',
        search: searchQuery,
        limit: 20
      });
      setMemories(response.memories || []);
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMemory = async (memoryData) => {
    try {
      await memoriesAPI.create({
        ...memoryData,
        type: 'special'
      });
      fetchMemories();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create memory:', error);
      throw error;
    }
  };

  const handleDeleteMemory = async (id) => {
    try {
      await memoriesAPI.delete(id);
      fetchMemories();
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  };

  const handleEditMemory = async (memoryData) => {
    try {
      await memoriesAPI.update(editingMemory._id, memoryData);
      fetchMemories();
      setShowEditModal(false);
      setEditingMemory(null);
    } catch (error) {
      console.error('Failed to update memory:', error);
      throw error;
    }
  };

  // Show loading while checking PIN
  if (checkingPin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show PIN setup modal
  if (showPinSetup) {
    return (
      <PinSetup
        section="memories"
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    );
  }

  // Show PIN authentication modal
  if (showPinAuth) {
    return (
      <PinAuth
        section="memories"
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">💭 Special Memories</h1>
          <p className="text-gray-600">Store and cherish your most precious memories</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            New Memory
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No memories yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first special memory to cherish forever
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Create Memory
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <MemoryCard
                key={memory._id}
                memory={memory}
                onDelete={() => handleDeleteMemory(memory._id)}
                onEdit={(memory) => {
                  setEditingMemory(memory);
                  setShowEditModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateMemoryModal
          type="special"
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateMemory}
        />
      )}

      {showEditModal && editingMemory && (
        <CreateMemoryModal
          type="special"
          onClose={() => {
            setShowEditModal(false);
            setEditingMemory(null);
          }}
          onCreate={handleEditMemory}
          editMode={true}
          initialData={editingMemory}
        />
      )}
    </div>
  );
};

// Memory Card Component
const MemoryCard = ({ memory, onDelete, onEdit }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCardClick = () => {
    if (showDeleteConfirm) return;
    onEdit(memory);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900 truncate">{memory.title}</h3>
        <div className="flex items-center space-x-2">
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
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
        {memory.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{new Date(memory.date).toLocaleDateString()}</span>
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex space-x-1">
            {memory.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-gray-100 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

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
            <h3 className="text-lg font-medium mb-4">Move to Recycle Bin?</h3>
            <p className="text-gray-600 mb-6">
              This will move "{memory.title}" to the recycle bin. You can restore it later or delete it permanently.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Move to Bin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Memory Modal Component
const CreateMemoryModal = ({ type, onClose, onCreate, editMode = false, initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [mood, setMood] = useState(initialData?.mood || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');
    try {
      await onCreate({
        title: title.trim(),
        content: content.trim(),
        mood: mood || null,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        date: new Date()
      });
    } catch (error) {
      console.error('Failed to create memory:', error);
      if (error.message && error.message.includes('already exists')) {
        setError('A memory with this title already exists.');
      } else {
        setError(error.message || 'Failed to create memory');
      }
      return;
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
    { value: 'calm', emoji: '😌', label: 'Calm' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'grateful', emoji: '🙏', label: 'Grateful' },
    { value: 'nostalgic', emoji: '🥺', label: 'Nostalgic' },
    { value: 'content', emoji: '😊', label: 'Content' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? `✏️ Edit Memory` : `⭐ New Special Memory`}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="A special moment..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your memory here..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mood (optional)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {moods.map((moodOption) => (
                <button
                  key={moodOption.value}
                  type="button"
                  onClick={() => setMood(mood === moodOption.value ? '' : moodOption.value)}
                  className={`p-2 rounded-lg border text-sm flex items-center justify-center space-x-1 ${
                    mood === moodOption.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{moodOption.emoji}</span>
                  <span>{moodOption.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (optional)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="family, vacation, work (comma separated)"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim() || !title.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Memory' : 'Create Memory')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemoriesPage;