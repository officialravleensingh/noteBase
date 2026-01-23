'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { remindersAPI } from '../../lib/api';
import MainNavigation from '../../components/MainNavigation';
import SectionAuth from '../../components/SectionAuth';

const RemindersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const needsVerification = searchParams.get('verify') === 'true';
  
  const [isAuthenticated, setIsAuthenticated] = useState(!needsVerification);
  const [reminders, setReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchReminders();
      fetchUpcomingReminders();
    }
  }, [isAuthenticated, searchQuery, filterCategory]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        limit: 50
      };
      const response = await remindersAPI.getAll(params);
      setReminders(response.reminders || []);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingReminders = async () => {
    try {
      const response = await remindersAPI.getUpcoming(7);
      setUpcomingReminders(response || []);
    } catch (error) {
      console.error('Failed to fetch upcoming reminders:', error);
    }
  };

  const handleCreateReminder = async (reminderData) => {
    try {
      await remindersAPI.create(reminderData);
      fetchReminders();
      fetchUpcomingReminders();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create reminder:', error);
    }
  };

  const handleCompleteReminder = async (id) => {
    try {
      await remindersAPI.complete(id);
      fetchReminders();
      fetchUpcomingReminders();
    } catch (error) {
      console.error('Failed to complete reminder:', error);
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await remindersAPI.delete(id);
      fetchReminders();
      fetchUpcomingReminders();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meeting': return '🤝';
      case 'birthday': return '🎂';
      case 'medication': return '💊';
      case 'task': return '✅';
      case 'event': return '📅';
      default: return '⏰';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isAuthenticated) {
    return (
      <SectionAuth
        section="reminders"
        onSuccess={() => setIsAuthenticated(true)}
        onCancel={() => router.push('/dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">⏰ Reminders</h1>
          <p className="text-gray-600">Manage your tasks, events, and recurring reminders</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📋</div>
              <div>
                <p className="text-sm text-gray-600">Total Reminders</p>
                <p className="text-xl font-semibold text-gray-900">{reminders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⏳</div>
              <div>
                <p className="text-sm text-gray-600">Upcoming (7 days)</p>
                <p className="text-xl font-semibold text-gray-900">{upcomingReminders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-semibold text-gray-900">
                  {reminders.filter(r => r.isCompleted).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveView('list')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 List View
              </button>
              <button
                onClick={() => setActiveView('upcoming')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === 'upcoming'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⏳ Upcoming
              </button>
            </nav>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="meeting">🤝 Meetings</option>
              <option value="birthday">🎂 Birthdays</option>
              <option value="medication">💊 Medication</option>
              <option value="task">✅ Tasks</option>
              <option value="event">📅 Events</option>
              <option value="other">⏰ Other</option>
            </select>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            New Reminder
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeView === 'list' ? (
          <RemindersList 
            reminders={reminders}
            onComplete={handleCompleteReminder}
            onDelete={handleDeleteReminder}
          />
        ) : (
          <UpcomingView 
            reminders={upcomingReminders}
            onComplete={handleCompleteReminder}
            onDelete={handleDeleteReminder}
          />
        )}
      </div>

      {/* Create Reminder Modal */}
      {showCreateModal && (
        <CreateReminderModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateReminder}
        />
      )}
    </div>
  );
};

// Reminders List Component
const RemindersList = ({ reminders, onComplete, onDelete }) => {
  if (reminders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⏰</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders yet</h3>
        <p className="text-gray-600">Create your first reminder to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="divide-y divide-gray-200">
        {reminders.map((reminder) => (
          <ReminderCard
            key={reminder._id}
            reminder={reminder}
            onComplete={() => onComplete(reminder._id)}
            onDelete={() => onDelete(reminder._id)}
          />
        ))}
      </div>
    </div>
  );
};

// Upcoming View Component
const UpcomingView = ({ reminders, onComplete, onDelete }) => {
  const groupedReminders = reminders.reduce((groups, reminder) => {
    const date = new Date(reminder.datetime).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(reminder);
    return groups;
  }, {});

  if (reminders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming reminders</h3>
        <p className="text-gray-600">You're all caught up for the next 7 days!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedReminders).map(([date, dayReminders]) => (
        <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium text-gray-900">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {dayReminders.map((reminder) => (
              <ReminderCard
                key={reminder._id}
                reminder={reminder}
                onComplete={() => onComplete(reminder._id)}
                onDelete={() => onDelete(reminder._id)}
                showDate={false}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Reminder Card Component
const ReminderCard = ({ reminder, onComplete, onDelete, showDate = true }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meeting': return '🤝';
      case 'birthday': return '🎂';
      case 'medication': return '💊';
      case 'task': return '✅';
      case 'event': return '📅';
      default: return '⏰';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`p-4 hover:bg-gray-50 ${reminder.isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-2xl">{getCategoryIcon(reminder.category)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-medium ${reminder.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {reminder.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                {reminder.priority}
              </span>
              {reminder.type === 'recurring' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  🔄 Recurring
                </span>
              )}
            </div>
            
            {reminder.description && (
              <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
            )}
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {showDate && (
                <span>📅 {new Date(reminder.datetime).toLocaleDateString()}</span>
              )}
              <span>🕐 {new Date(reminder.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="capitalize">📂 {reminder.category}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {!reminder.isCompleted && (
            <button
              onClick={onComplete}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Complete
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium mb-4">Delete Reminder?</h3>
            <p className="text-gray-600 mb-6">
              This will move the reminder to recycle bin. You can restore it later or delete permanently.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Reminder Modal Component
const CreateReminderModal = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('once');
  const [datetime, setDatetime] = useState('');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState('medium');
  const [recurrence, setRecurrence] = useState({
    pattern: 'daily',
    interval: 1,
    endDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !datetime) return;

    setLoading(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        type,
        datetime,
        category,
        priority,
        recurrence: type === 'recurring' ? recurrence : undefined,
        notifications: [
          { type: 'email', timing: 15 }
        ]
      });
    } catch (error) {
      console.error('Failed to create reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">⏰ New Reminder</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Reminder title..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional details..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="once">One-time</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="meeting">🤝 Meeting</option>
                <option value="birthday">🎂 Birthday</option>
                <option value="medication">💊 Medication</option>
                <option value="task">✅ Task</option>
                <option value="event">📅 Event</option>
                <option value="other">⏰ Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>
          
          {type === 'recurring' && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Recurrence Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pattern</label>
                  <select
                    value={recurrence.pattern}
                    onChange={(e) => setRecurrence({...recurrence, pattern: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
                  <input
                    type="date"
                    value={recurrence.endDate}
                    onChange={(e) => setRecurrence({...recurrence, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !title.trim() || !datetime}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Reminder'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RemindersPage;