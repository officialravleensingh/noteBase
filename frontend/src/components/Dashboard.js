'use client';
import { useState, useEffect } from 'react';
import { notesAPI, foldersAPI } from '../lib/api';
import NoteCard from './NoteCard';
import FolderCard from './FolderCard';
import CreateNoteModal from './CreateNoteModal';
import CreateFolderModal from './CreateFolderModal';
import NoteEditor from './NoteEditor';

export default function Dashboard({ user, logout }) {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const sidebarItemsPerPage = 3;
  const [sidebarPage, setSidebarPage] = useState(1);
  const [viewFilter, setViewFilter] = useState('both');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchData();
  }, [sortBy, sortOrder, selectedFolder, currentPage, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
    setSidebarPage(1);
  }, [searchQuery, selectedFolder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let notesParams = { 
        sortBy, 
        order: sortOrder,
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery
      };
      
      if (selectedFolder) {
        notesParams.folderId = selectedFolder;
      } else {
        notesParams.noFolder = true;
      }
      
      const [notesResponse, foldersResponse] = await Promise.all([
        notesAPI.getAll(notesParams),
        foldersAPI.getAll({ search: searchQuery })
      ]);
      
      setNotes(notesResponse.notes || []);
      setFolders(foldersResponse.folders || []);
      setTotalItems((notesResponse.total || 0) + (foldersResponse.folders?.length || 0));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData) => {
    const finalFolderId = selectedFolder || noteData.folderId || null;
    const noteToCreate = {
      ...noteData,
      folderId: finalFolderId
    };
    
    console.log('Creating note with data:', {
      selectedFolder,
      noteDataFolderId: noteData.folderId,
      finalFolderId,
      noteToCreate
    });
    
    try {
      await notesAPI.create(noteToCreate);
      fetchData();
      setShowCreateNote(false);
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  };

  const handleCreateFolder = async (folderData) => {
    try {
      await foldersAPI.create(folderData);
      fetchData();
      setShowCreateFolder(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await notesAPI.delete(noteId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await foldersAPI.delete(folderId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const handleOpenFolder = (folderId) => {
    setSelectedFolder(folderId);
    setSelectedNoteId(null);
  };

  const handleSelectNote = (noteId) => {
    setSelectedNoteId(noteId);
    setSidebarPage(1);
  };

  const handleItemSelect = (id, type) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };



  const handleBulkDelete = async () => {
    try {
      const noteIds = selectedItems.filter(id => notes.some(note => note.id === id));
      const folderIds = selectedItems.filter(id => folders.some(folder => folder.id === id));
      
      await Promise.all([
        ...noteIds.map(id => notesAPI.delete(id)),
        ...folderIds.map(id => foldersAPI.delete(id))
      ]);
      
      setSelectedItems([]);
      setSelectionMode(false);
      fetchData();
    } catch (error) {
      console.error('Failed to delete items:', error);
    }
  };

  const filteredNotes = notes.filter(note => 
    (viewFilter === 'both' || viewFilter === 'notes') &&
    (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFolders = folders.filter(folder => 
    (viewFilter === 'both' || viewFilter === 'folders') &&
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarStartIndex = (sidebarPage - 1) * sidebarItemsPerPage;
  const sidebarEndIndex = sidebarStartIndex + sidebarItemsPerPage;
  
  const displayedNotes = selectedNoteId ? 
    filteredNotes.slice(sidebarStartIndex, sidebarEndIndex) : filteredNotes;
  const displayedFolders = selectedNoteId ? 
    filteredFolders.slice(sidebarStartIndex, sidebarEndIndex) : filteredFolders;
    
  const sidebarTotalItems = filteredNotes.length + filteredFolders.length;
  const sidebarTotalPages = Math.ceil(sidebarTotalItems / sidebarItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">NoteBase</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Second Navigation Bar */}
      <div className="bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedFolder ? `Folder: ${folders.find(f => f.id === selectedFolder)?.name}` : 'Dashboard'}
              </h2>
              {selectedFolder && (
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                >← Back to All Items
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              {!selectedFolder && (
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >New Folder
                </button>
              )}
              <button
                onClick={() => setShowCreateNote(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1" style={{height: 'calc(100vh - 120px)'}}>
        {/* Sidebar */}
        <div className={`bg-white shadow-sm border-r transition-all duration-300 flex flex-col ${
          selectedNoteId ? 'w-1/5' : 'w-full'
        } h-full`}>

        <main className={`flex-1 py-6 px-4 sm:px-6 lg:px-8 ${
          selectedNoteId ? '' : 'overflow-y-auto h-full'
        }`}>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search notes and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-64 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <select
                value={viewFilter}
                onChange={(e) => setViewFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="both">Both</option>
                <option value="notes">Notes Only</option>
                <option value="folders">Folders Only</option>
              </select>
              <button
                onClick={() => setSelectionMode(!selectionMode)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectionMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {selectionMode ? 'Cancel' : 'Select'}
              </button>
            </div>
            
            {selectionMode && selectedItems.length > 0 && (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Delete Selected ({selectedItems.length})
                </button>
              </div>
            )}
          </div>

          {/* Sorting */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="updatedAt-desc">Latest Updated</option>
              <option value="updatedAt-asc">Oldest Updated</option>
              <option value="createdAt-desc">Newest Created</option>
              <option value="createdAt-asc">Oldest Created</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select>
          </div>

          {/* Content grid */}
          {filteredNotes.length === 0 && filteredFolders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items found</p>
              <div className="mt-4 space-x-4">
                <button
                  onClick={() => setShowCreateNote(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-base font-medium"
                >
                  Create Your First Note
                </button>
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md text-base font-medium"
                >
                  Create Your First Folder
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={`${selectedNoteId ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
                {/* Show folders */}
                {!selectedFolder && displayedFolders.map(folder => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onDelete={handleDeleteFolder}
                    onOpen={handleOpenFolder}
                    selectionMode={selectionMode}
                    isSelected={selectedItems.includes(folder.id)}
                    onSelect={() => handleItemSelect(folder.id, 'folder')}
                  />
                ))}
                {/* Show notes */}
                {displayedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onDelete={handleDeleteNote}
                    onSelect={() => handleSelectNote(note.id)}
                    selectionMode={selectionMode}
                    isSelected={selectedItems.includes(note.id)}
                    onItemSelect={() => handleItemSelect(note.id, 'note')}
                  />
                ))}
              </div>
              
              {/* Dashboard Pagination */}
              {!selectedNoteId && totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border rounded-md disabled:opacity-50 text-sm"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-md text-sm ${
                        currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border rounded-md disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
              
              {/* Sidebar Pagination */}
              {selectedNoteId && sidebarTotalPages > 1 && (
                <div className="flex justify-center items-center space-x-1 mt-4">
                  <button
                    onClick={() => setSidebarPage(Math.max(1, sidebarPage - 1))}
                    disabled={sidebarPage === 1}
                    className="px-2 py-1 border rounded text-xs disabled:opacity-50"
                  >
                    ←
                  </button>
                  
                  <span className="px-2 py-1 text-xs text-gray-600">
                    {sidebarPage} of {sidebarTotalPages}
                  </span>
                  
                  <button
                    onClick={() => setSidebarPage(Math.min(sidebarTotalPages, sidebarPage + 1))}
                    disabled={sidebarPage === sidebarTotalPages}
                    className="px-2 py-1 border rounded text-xs disabled:opacity-50"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
        </div>

        {/* Editor Sidebar */}
        {selectedNoteId && (
          <div className="flex-1 bg-white border-l h-full">
            <NoteEditor noteId={selectedNoteId} onClose={() => setSelectedNoteId(null)} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateNote && (
        <CreateNoteModal
          folders={folders}
          selectedFolder={selectedFolder}
          onClose={() => setShowCreateNote(false)}
          onCreate={handleCreateNote}
        />
      )}

      {showCreateFolder && (
        <CreateFolderModal
          onClose={() => setShowCreateFolder(false)}
          onCreate={handleCreateFolder}
        />
      )}
    </div>
  );
}