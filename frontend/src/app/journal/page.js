'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { journalAPI, pinAPI } from '../../lib/api';
import MainNavigation from '../../components/MainNavigation';
import PinAuth from '../../components/PinAuth';
import PinSetup from '../../components/PinSetup';

const JournalPage = () => {
  const router = useRouter();
  
  const [entries, setEntries] = useState([]);
  const [todayEntry, setTodayEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinAuth, setShowPinAuth] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [checkingPin, setCheckingPin] = useState(true);

  useEffect(() => {
    checkPinStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayEntry();
      fetchEntries();
    }
  }, [isAuthenticated]);

  const checkPinStatus = async () => {
    try {
      const response = await pinAPI.checkPin('journal');
      if (response.hasPin) {
        setShowPinAuth(true);
      } else {
        setShowPinSetup(true);
      }
    } catch (error) {
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

  const fetchTodayEntry = async () => {
    try {
      const response = await journalAPI.getTodayEntry();
      setTodayEntry(response.entry);
      if (response.entry) {
        setContent(response.entry.content || '');
        setMood(response.entry.mood || '');
      }
    } catch (error) {
      // Silent fail
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await journalAPI.getAll({ 
        sortBy: 'date', 
        order: 'desc',
        limit: 30 
      });
      setEntries(response.entries || []);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setSaving(true);
    try {
      if (todayEntry) {
        await journalAPI.update(todayEntry._id, { content, mood });
      } else {
        const response = await journalAPI.create({ 
          date: new Date().toISOString().split('T')[0],
          content, 
          mood 
        });
        setTodayEntry(response.entry);
      }
      await fetchEntries();
    } catch (error) {
      // Silent fail
    } finally {
      setSaving(false);
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


  if (checkingPin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  if (showPinSetup) {
    return (
      <PinSetup
        section="journal"
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    );
  }


  if (showPinAuth) {
    return (
      <PinAuth
        section="journal"
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📔 Daily Journal</h1>
          <p className="text-gray-600">Capture your thoughts and feelings each day</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Recent Entries</h3>
              </div>
              
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : entries.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No entries yet. Start writing your first journal entry!
                  </p>
                ) : (
                  entries.map((entry) => {
                    const entryDate = new Date(entry.date).toDateString();
                    const today = new Date().toDateString();
                    const isToday = entryDate === today;
                    
                    return (
                      <div
                        key={entry._id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (isToday) {
                            setContent(entry.content || '');
                            setMood(entry.mood || '');
                            setSelectedEntry(null);
                            setIsViewMode(false);
                          } else {
                            setSelectedEntry(entry);
                            setIsViewMode(true);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${
                            isToday ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            {isToday ? 'Today' : new Date(entry.date).toLocaleDateString()}
                          </span>
                          <div className="flex items-center space-x-1">
                            {entry.mood && (
                              <span className="text-lg">
                                {moods.find(m => m.value === entry.mood)?.emoji}
                              </span>
                            )}
                            {!isToday && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                View Only
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {entry.content?.substring(0, 100)}...
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>


          <div className="lg:col-span-2">
            {isViewMode && selectedEntry ? (
              // Read-only view
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Journal Entry - {new Date(selectedEntry.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedEntry(null);
                        setIsViewMode(false);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {selectedEntry.mood && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mood
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {moods.find(m => m.value === selectedEntry.mood)?.emoji}
                        </span>
                        <span className="text-gray-700">
                          {moods.find(m => m.value === selectedEntry.mood)?.label}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 min-h-64 whitespace-pre-wrap">
                      {selectedEntry.content || 'No content available.'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode for Today's Entry */
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Today's Entry - {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Mood Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How are you feeling today?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((moodOption) => (
                        <button
                          key={moodOption.value}
                          onClick={() => setMood(moodOption.value)}
                          className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                            mood === moodOption.value
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {moodOption.emoji} {moodOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's on your mind?
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write about your day, thoughts, feelings, or anything that comes to mind..."
                      className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving || !content.trim()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Entry'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalPage;