'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { notesAPI, foldersAPI } from '../lib/api';
import ExportModal from './ExportModal';

export default function NoteEditor({ noteId, onClose }) {
  const router = useRouter();
  const [note, setNote] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [currentListStyle, setCurrentListStyle] = useState('');
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);
  const [underlineActive, setUnderlineActive] = useState(false);
  const [currentAlignment, setCurrentAlignment] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [noteId]);

  useEffect(() => {
    updateWordCount();
  }, [content]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [noteResponse, foldersResponse] = await Promise.all([
        notesAPI.getById(noteId),
        foldersAPI.getAll()
      ]);
      
      const noteData = noteResponse.note;
      setNote(noteData);
      setTitle(noteData.title || '');
      setContent(noteData.content || '');
      setFolderId(noteData.folderId || '');
      setFolders(foldersResponse.folders || []);
      
      // Store original values for change detection
      setOriginalTitle(noteData.title || '');
      setOriginalContent(noteData.content || '');
      
      // Set initial content in editor
      if (contentRef.current) {
        contentRef.current.innerHTML = noteData.content || '';
      }
    } catch (error) {
      console.error('Failed to fetch note:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateWordCount = () => {
    if (!content) {
      setWordCount(0);
      return;
    }
    const plainText = content.replace(/<[^>]*>/g, '');
    const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await notesAPI.update(noteId, {
        title: title.trim() || 'Untitled',
        content,
        folderId: folderId || null
      });
      
      // Update original values after successful save
      setOriginalTitle(title.trim() || 'Untitled');
      setOriginalContent(content);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowSaveDialog(true);
    } else {
      router.push('/dashboard');
    }
  };

  const handleSaveAndExit = async () => {
    await handleSave();
    router.push('/dashboard');
  };

  const handleExitWithoutSaving = () => {
    router.push('/dashboard');
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    setContent(contentRef.current.innerHTML);
  };



  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = `<img src="${e.target.result}" style="max-width: 100%; height: auto; margin: 8px 0;" />`;
        document.execCommand('insertHTML', false, img);
        handleContentChange({ target: contentRef.current });
      };
      reader.readAsDataURL(file);
    }
  };

  const insertCode = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      document.execCommand('insertHTML', false, `<code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace;">${selection.toString()}</code>`);
    } else {
      document.execCommand('insertHTML', false, `<code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace;">code</code>`);
    }
    handleContentChange({ target: contentRef.current });
  };

  const insertSuperscript = () => {
    document.execCommand('superscript', false, null);
    handleContentChange({ target: contentRef.current });
  };

  const insertSubscript = () => {
    document.execCommand('subscript', false, null);
    handleContentChange({ target: contentRef.current });
  };

  const handleFindReplace = () => {
    if (!findText) return;
    
    const content = contentRef.current.innerHTML;
    const regex = new RegExp(findText, 'gi');
    const newContent = content.replace(regex, replaceText);
    
    contentRef.current.innerHTML = newContent;
    setContent(newContent);
    handleContentChange({ target: contentRef.current });
    
    setFindText('');
    setReplaceText('');
    setShowFindReplace(false);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.innerHTML;
    setContent(newContent);
    
    // Check for unsaved changes
    if (newContent !== originalContent || title !== originalTitle) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
    
    // Update toolbar states based on current selection
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        setBoldActive(document.queryCommandState('bold'));
        setItalicActive(document.queryCommandState('italic'));
        setUnderlineActive(document.queryCommandState('underline'));
      }
    }, 10);
  };



  const handlePaste = (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('text/html') || clipboardData.getData('text/plain');
    
    // Allow default paste behavior for tables and formatted content
    if (pastedData.includes('<table') || pastedData.includes('<tr') || pastedData.includes('<td')) {
      // Let browser handle table pasting
      setTimeout(() => {
        handleContentChange({ target: contentRef.current });
      }, 10);
    }
  };

  const handleKeyDown = (e) => {
    // Handle keyboard shortcuts
    if ((e.metaKey || e.ctrlKey)) {
      if (e.key === 'b') {
        e.preventDefault();
        setBoldActive(!boldActive);
        document.execCommand('bold', false, null);
        return;
      }
      if (e.key === 'i') {
        e.preventDefault();
        setItalicActive(!italicActive);
        document.execCommand('italic', false, null);
        return;
      }
      if (e.key === 'u') {
        e.preventDefault();
        setUnderlineActive(!underlineActive);
        document.execCommand('underline', false, null);
        return;
      }
      if (e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
        return;
      }
    }
    
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const listItem = range.startContainer.closest ? range.startContainer.closest('li') : 
                        range.startContainer.parentElement?.closest('li');
        
        if (listItem && range.startOffset === 0 && listItem.textContent.trim() === '') {
          e.preventDefault();
          // Exit all lists completely
          while (document.queryCommandState('insertUnorderedList') || document.queryCommandState('insertOrderedList')) {
            document.execCommand('insertUnorderedList', false, null);
          }
          setCurrentListStyle('');
          return;
        }
      }
    }
    
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const listItem = range.startContainer.closest ? range.startContainer.closest('li') : 
                        range.startContainer.parentElement?.closest('li');
        
        if (listItem) {
          e.preventDefault();
          const newLi = document.createElement('li');
          newLi.innerHTML = '<br>';
          
          if (listItem.nextSibling) {
            listItem.parentNode.insertBefore(newLi, listItem.nextSibling);
          } else {
            listItem.parentNode.appendChild(newLi);
          }
          
          const newRange = document.createRange();
          newRange.setStart(newLi, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          
          handleContentChange({ target: contentRef.current });
        }
      }
    }
  };

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`${onClose ? 'h-full flex flex-col' : 'min-h-screen'} bg-gray-50`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-800 flex items-center"
                >
                  ← Close
                </button>
              )}
              {!onClose && (
                <button
                  onClick={handleBackClick}
                  className="text-gray-600 hover:text-gray-800 flex items-center"
                >
                  ← Back to Dashboard
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="">No Folder</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowExportModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
              >
                Export
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className={`${onClose ? 'flex-1 overflow-y-auto' : 'max-w-4xl mx-auto'} px-4 py-6`}>
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Title */}
          <div className="p-6 border-b">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                // Check for unsaved changes
                if (e.target.value !== originalTitle || content !== originalContent) {
                  setHasUnsavedChanges(true);
                } else {
                  setHasUnsavedChanges(false);
                }
              }}
              placeholder="Note title..."
              className="w-full text-2xl font-bold border-none outline-none"
            />
          </div>

          {/* Toolbar */}
          <div className="px-6 py-3 border-b bg-gray-50 flex flex-wrap gap-3 items-center">
            <button
              onClick={() => {
                document.execCommand('bold', false, null);
                setBoldActive(!boldActive);
              }}
              className={`px-3 py-1 border rounded font-bold ${
                boldActive ? 'bg-gray-300 border-gray-400' : 'hover:bg-gray-200'
              }`}
            >
              B
            </button>
            <button
              onClick={() => {
                document.execCommand('italic', false, null);
                setItalicActive(!italicActive);
              }}
              className={`px-3 py-1 border rounded italic ${
                italicActive ? 'bg-gray-300 border-gray-400' : 'hover:bg-gray-200'
              }`}
            >
              I
            </button>
            <button
              onClick={() => {
                document.execCommand('underline', false, null);
                setUnderlineActive(!underlineActive);
                // Force focus back to editor to maintain formatting state
                setTimeout(() => {
                  if (contentRef.current) {
                    contentRef.current.focus();
                  }
                }, 10);
              }}
              className={`px-3 py-1 border rounded underline ${
                underlineActive ? 'bg-gray-300 border-gray-400' : 'hover:bg-gray-200'
              }`}
            >
              U
            </button>
            <div className="border-l h-6 mx-2"></div>
            <button
              onClick={() => {
                formatText('justifyLeft');
                setCurrentAlignment('left');
              }}
              className={`px-3 py-1 border rounded text-sm ${
                currentAlignment === 'left' ? 'bg-gray-300 border-gray-400' : 'hover:bg-gray-200'
              }`}
              title="Align Left"
            >
              ≡
            </button>
            <button
              onClick={() => {
                formatText('justifyCenter');
                setCurrentAlignment('center');
              }}
              className={`px-3 py-1 border rounded text-sm ${
                currentAlignment === 'center' ? 'bg-gray-300 border-gray-400' : 'hover:bg-gray-200'
              }`}
              title="Align Center"
            >
              ≣
            </button>
            <button
              onClick={() => {
                formatText('justifyRight');
                setCurrentAlignment('right');
              }}
              className={`px-3 py-1 border rounded text-sm ${
                currentAlignment === 'right' ? 'bg-gray-300 border-gray-400' : 'hover:bg-gray-200'
              }`}
              title="Align Right"
            >
              ≡
            </button>
            <div className="border-l mx-2"></div>
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'disable') {
                  // Exit all lists completely
                  while (document.queryCommandState('insertUnorderedList') || document.queryCommandState('insertOrderedList')) {
                    document.execCommand('insertUnorderedList', false, null);
                  }
                  setCurrentListStyle('');
                  return;
                }
                if (value === '') return;
                
                if (value === 'bullets') {
                  // Exit any existing lists first
                  while (document.queryCommandState('insertUnorderedList') || document.queryCommandState('insertOrderedList')) {
                    document.execCommand('insertUnorderedList', false, null);
                  }
                  document.execCommand('insertUnorderedList', false, null);
                  setCurrentListStyle('bullets');
                } else if (value === 'numbers') {
                  // Exit any existing lists first
                  while (document.queryCommandState('insertUnorderedList') || document.queryCommandState('insertOrderedList')) {
                    document.execCommand('insertUnorderedList', false, null);
                  }
                  document.execCommand('insertOrderedList', false, null);
                  setCurrentListStyle('numbers');
                } else if (value === 'arrows') {
                  // Exit any existing lists first
                  while (document.queryCommandState('insertUnorderedList') || document.queryCommandState('insertOrderedList')) {
                    document.execCommand('insertUnorderedList', false, null);
                  }
                  document.execCommand('insertUnorderedList', false, null);
                  setTimeout(() => {
                    const lists = contentRef.current.querySelectorAll('ul');
                    lists.forEach(list => {
                      if (!list.classList.contains('arrow-list')) {
                        list.style.listStyleType = 'none';
                        list.classList.add('arrow-list');
                      }
                    });
                  }, 10);
                  setCurrentListStyle('arrows');
                }
                
                setTimeout(() => handleContentChange({ target: contentRef.current }), 10);
              }}
              className={`border rounded px-2 py-1 text-sm ${
                currentListStyle ? 'bg-gray-300 border-gray-400' : ''
              }`}
              value=""
            >
              <option value="">
                {currentListStyle === 'bullets' ? '• Bullets' :
                 currentListStyle === 'numbers' ? '1. Numbers' :
                 currentListStyle === 'arrows' ? '→ Arrows' : 'List Style'}
              </option>
              {currentListStyle && <option value="disable">Disable List</option>}
              <option value="bullets">• Bullets</option>
              <option value="numbers">1. Numbers</option>
              <option value="arrows">→ Arrows</option>
            </select>

            <input
              type="color"
              onChange={(e) => {
                const color = e.target.value;
                const selection = window.getSelection();
                
                if (selection.rangeCount > 0 && !selection.isCollapsed) {
                  const range = selection.getRangeAt(0);
                  const span = document.createElement('span');
                  span.style.color = color;
                  
                  try {
                    range.surroundContents(span);
                  } catch (ex) {
                    span.appendChild(range.extractContents());
                    range.insertNode(span);
                  }
                } else {
                  document.execCommand('styleWithCSS', false, true);
                  document.execCommand('foreColor', false, color);
                }
                
                handleContentChange({ target: contentRef.current });
              }}
              className="w-8 h-8 border rounded cursor-pointer"
              title="Text Color"
            />
            
            <div className="border-l h-6 mx-2"></div>
            
            <button
              onClick={() => {
                document.execCommand('strikeThrough', false, null);
                handleContentChange({ target: contentRef.current });
              }}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-200"
              title="Strikethrough"
            >
              S̶
            </button>
            
            <button
              onClick={insertCode}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-200 font-mono"
              title="Code"
            >
              &lt;/&gt;
            </button>
            
            <button
              onClick={insertSuperscript}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-200"
              title="Superscript"
            >
              X²
            </button>
            
            <button
              onClick={insertSubscript}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-200"
              title="Subscript"
            >
              X₂
            </button>
            
            <div className="border-l h-6 mx-2"></div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-200"
              title="Insert Image"
            >
              Insert Image
            </button>
            
            <button
              onClick={() => setShowFindReplace(true)}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-200"
              title="Find & Replace (Ctrl+F)"
            >
              Find & Replace
            </button>
          </div>

          {/* Content */}
          <div className="p-6 min-h-96">
            <div
              ref={contentRef}
              contentEditable
              onInput={handleContentChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onMouseUp={() => {
                // Update toolbar states when clicking/selecting text
                setTimeout(() => {
                  setBoldActive(document.queryCommandState('bold'));
                  setItalicActive(document.queryCommandState('italic'));
                  setUnderlineActive(document.queryCommandState('underline'));
                }, 10);
              }}
              className="outline-none min-h-80 leading-relaxed"
              style={{ 
                minHeight: '300px',
                direction: 'ltr',
                textAlign: 'left',
                overflow: 'hidden',
                wordWrap: 'break-word'
              }}
              suppressContentEditableWarning={true}
            />
          </div>

          {/* Word count */}
          <div className="px-6 py-3 border-t bg-gray-50 text-right">
            <span className="text-sm text-gray-500">{wordCount} words</span>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        noteId={noteId}
        noteTitle={title || 'Untitled'}
      />

      {/* Find & Replace Modal */}
      {showFindReplace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Find & Replace</h3>
              <button
                onClick={() => setShowFindReplace(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Find:</label>
                <input
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Enter text to find"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Replace with:</label>
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Enter replacement text"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowFindReplace(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFindReplace}
                  disabled={!findText}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Replace All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Unsaved Changes</h3>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Do you want to save before leaving?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleExitWithoutSaving}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Don't Save
              </button>
              <button
                onClick={handleSaveAndExit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}