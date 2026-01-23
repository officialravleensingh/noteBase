'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { notesAPI, foldersAPI } from '../lib/api';
import ShareModal from './ShareModal';
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
  const [codeActive, setCodeActive] = useState(false);
  const [superscriptActive, setSuperscriptActive] = useState(false);
  const [subscriptActive, setSubscriptActive] = useState(false);
  const [currentAlignment, setCurrentAlignment] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [lastSaved, setLastSaved] = useState(null);
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [noteId]);

  useEffect(() => {
    updateWordCount();
  }, [content]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFormatDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (hasUnsavedChanges && !saving) {
      setAutoSaveStatus('unsaved');
      
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Auto-save after 30 seconds
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, saving]);

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
      
      setOriginalTitle(noteData.title || '');
      setOriginalContent(noteData.content || '');
      
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
    if (contentRef.current) {
      const htmlContent = contentRef.current.innerHTML;
      const plainText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
      const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setAutoSaveStatus('saving');
      
      await notesAPI.update(noteId, {
        title: title.trim() || 'Untitled',
        content,
        folderId: folderId || null
      });
      
      setOriginalTitle(title.trim() || 'Untitled');
      setOriginalContent(content);
      setHasUnsavedChanges(false);
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
      
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      setAutoSaveStatus('unsaved');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || saving) return;
    
    try {
      setAutoSaveStatus('saving');
      
      await notesAPI.update(noteId, {
        title: title.trim() || 'Untitled',
        content,
        folderId: folderId || null
      });
      
      setOriginalTitle(title.trim() || 'Untitled');
      setOriginalContent(content);
      setHasUnsavedChanges(false);
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('unsaved');
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
    if (codeActive) {
      document.execCommand('removeFormat', false, null);
      setCodeActive(false);
    } else {
      const selection = window.getSelection();
      if (selection.rangeCount > 0 && !selection.isCollapsed) {
        document.execCommand('insertHTML', false, `<code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace;">${selection.toString()}</code>`);
      } else {
        document.execCommand('insertHTML', false, `<code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace;">code</code>`);
      }
      setCodeActive(true);
    }
    handleContentChange({ target: contentRef.current });
  };

  const insertSuperscript = () => {
    document.execCommand('superscript', false, null);
    setSuperscriptActive(!superscriptActive);
    handleContentChange({ target: contentRef.current });
  };

  const insertSubscript = () => {
    document.execCommand('subscript', false, null);
    setSubscriptActive(!subscriptActive);
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
    
    if (newContent !== originalContent || title !== originalTitle) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
    
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
    
    if (pastedData.includes('<table') || pastedData.includes('<tr') || pastedData.includes('<td')) {
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
        
        // Exit list on empty backspace
        if (listItem && range.startOffset === 0 && listItem.textContent.trim() === '') {
          e.preventDefault();
          // Remove all list formatting
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
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <div className="w-1/3">
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
            
            <div className="w-1/3"></div>
            
            <div className="w-1/3 flex justify-end items-center space-x-4">
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
                onClick={() => setShowShareModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
              >
                Share
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {autoSaveStatus !== 'saved' && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-lg flex items-center gap-2 text-sm">
          {autoSaveStatus === 'saving' ? (
            <>
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-600">Auto-saving...</span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Unsaved changes</span>
            </>
          )}
        </div>
      )}

      <div className={`${onClose ? 'flex-1 flex flex-col' : 'max-w-4xl mx-auto'} px-4 py-6`}>
        <div className="bg-white rounded-lg shadow-sm border flex flex-col" style={{ height: onClose ? 'calc(85vh - 120px)' : 'calc(85vh - 140px)' }}>
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-center items-center gap-4 flex-shrink-0">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                className="px-4 py-2 border rounded text-base hover:bg-gray-200 flex items-center gap-2 font-medium"
              >
                Aa
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showFormatDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-10 p-3 min-w-64">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          document.execCommand('bold', false, null);
                          setBoldActive(!boldActive);
                        }}
                        className={`px-2 py-1 text-sm rounded font-bold ${
                          boldActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
                        }`}
                        title="Bold"
                      >
                        B
                      </button>
                      <button
                        onClick={() => {
                          document.execCommand('italic', false, null);
                          setItalicActive(!italicActive);
                        }}
                        className={`px-2 py-1 text-sm rounded italic ${
                          italicActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
                        }`}
                        title="Italic"
                      >
                        I
                      </button>
                      <button
                        onClick={() => {
                          document.execCommand('underline', false, null);
                          setUnderlineActive(!underlineActive);
                        }}
                        className={`px-2 py-1 text-sm rounded underline ${
                          underlineActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
                        }`}
                        title="Underline"
                      >
                        U
                      </button>
                      <button
                        onClick={() => {
                          document.execCommand('strikeThrough', false, null);
                          handleContentChange({ target: contentRef.current });
                        }}
                        className="px-2 py-1 text-sm rounded hover:bg-gray-200"
                        title="Strikethrough"
                      >
                        S̶
                      </button>
                    </div>
                    
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
                      className="w-8 h-6 rounded cursor-pointer"
                      title="Text Color"
                    />
                  </div>
                  
                  <div className="mb-2">
                    <button
                      onClick={() => {
                        document.execCommand('fontSize', false, '7');
                        handleContentChange({ target: contentRef.current });
                      }}
                      className="w-full px-2 py-1 text-left text-lg font-bold rounded hover:bg-gray-100"
                    >
                      Title
                    </button>
                  </div>
                  
                  <div className="mb-2">
                    <button
                      onClick={() => {
                        document.execCommand('fontSize', false, '6');
                        handleContentChange({ target: contentRef.current });
                      }}
                      className="w-full px-2 py-1 text-left text-base font-semibold rounded hover:bg-gray-100"
                    >
                      Heading 1
                    </button>
                    <button
                      onClick={() => {
                        document.execCommand('fontSize', false, '5');
                        handleContentChange({ target: contentRef.current });
                      }}
                      className="w-full px-2 py-1 text-left text-sm font-semibold rounded hover:bg-gray-100"
                    >
                      Heading 2
                    </button>
                    <button
                      onClick={() => {
                        document.execCommand('fontSize', false, '4');
                        handleContentChange({ target: contentRef.current });
                      }}
                      className="w-full px-2 py-1 text-left text-sm font-medium rounded hover:bg-gray-100"
                    >
                      Heading 3
                    </button>
                  </div>
                  
                  <div className="mb-2">
                    <button
                      onClick={() => {
                        document.execCommand('fontSize', false, '3');
                        handleContentChange({ target: contentRef.current });
                      }}
                      className="w-full px-2 py-1 text-left text-sm rounded hover:bg-gray-100"
                    >
                      Normal
                    </button>
                  </div>
                  
                  <div className="mb-2">
                    <button
                      onClick={() => {
                        document.execCommand('fontSize', false, '1');
                        handleContentChange({ target: contentRef.current });
                      }}
                      className="w-full px-2 py-1 text-left text-xs rounded hover:bg-gray-100"
                    >
                      Small
                    </button>
                  </div>
                  
                  <div className="mb-1">
                    <button
                      onClick={() => {
                        while (document.queryCommandState('insertUnorderedList') || document.queryCommandState('insertOrderedList')) {
                          document.execCommand('insertUnorderedList', false, null);
                        }
                        document.execCommand('insertUnorderedList', false, null);
                        setCurrentListStyle('bullets');
                        setTimeout(() => handleContentChange({ target: contentRef.current }), 10);
                      }}
                      className={`w-full px-2 py-1 text-left text-sm rounded ${
                        currentListStyle === 'bullets' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      • Bulleted List
                    </button>
                  </div>
                  
                  <div className="mb-1">
                    <button
                      onClick={() => {
                        while (document.queryCommandState('insertUnorderedList') || document.queryCommandState('insertOrderedList')) {
                          document.execCommand('insertUnorderedList', false, null);
                        }
                        document.execCommand('insertOrderedList', false, null);
                        setCurrentListStyle('numbers');
                        setTimeout(() => handleContentChange({ target: contentRef.current }), 10);
                      }}
                      className={`w-full px-2 py-1 text-left text-sm rounded ${
                        currentListStyle === 'numbers' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      1. Numbered List
                    </button>
                  </div>
                  
                  <div>
                    <button
                      onClick={() => {
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
                        setTimeout(() => handleContentChange({ target: contentRef.current }), 10);
                      }}
                      className={`w-full px-2 py-1 text-left text-sm rounded ${
                        currentListStyle === 'arrows' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      → Arrowed List
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-l h-8"></div>
            
            <button
              onClick={() => {
                formatText('justifyLeft');
                setCurrentAlignment('left');
              }}
              className={`px-3 py-2 border rounded text-sm ${
                currentAlignment === 'left' ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-200 border-gray-300'
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
              className={`px-3 py-2 border rounded text-sm ${
                currentAlignment === 'center' ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-200 border-gray-300'
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
              className={`px-3 py-2 border rounded text-sm ${
                currentAlignment === 'right' ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-200 border-gray-300'
              }`}
              title="Align Right"
            >
              ≡
            </button>
            
            <div className="border-l h-8"></div>
            
            <button
              onClick={insertCode}
              className={`px-3 py-2 border rounded text-sm font-mono ${
                codeActive ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-200 border-gray-300'
              }`}
              title="Code"
            >
              &lt;/&gt;
            </button>
            
            <button
              onClick={insertSuperscript}
              className={`px-3 py-2 border rounded text-sm ${
                superscriptActive ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-200 border-gray-300'
              }`}
              title="Superscript"
            >
              X²
            </button>
            
            <button
              onClick={insertSubscript}
              className={`px-3 py-2 border rounded text-sm ${
                subscriptActive ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-200 border-gray-300'
              }`}
              title="Subscript"
            >
              X₂
            </button>
            
            <div className="border-l h-8"></div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 border rounded text-sm hover:bg-gray-200 border-gray-300"
              title="Insert Image"
            >
              Image
            </button>
            
            <button
              onClick={() => setShowFindReplace(true)}
              className="px-3 py-2 border rounded text-sm hover:bg-gray-200 border-gray-300"
              title="Find & Replace (Ctrl+F)"
            >
              Find
            </button>
          </div>

          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-700 mr-2">Title:</span>
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
                className="flex-1 text-xl font-bold border-none outline-none"
              />
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col overflow-hidden">
            <div
              ref={contentRef}
              contentEditable
              onInput={handleContentChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onMouseUp={() => {
                setTimeout(() => {
                  setBoldActive(document.queryCommandState('bold'));
                  setItalicActive(document.queryCommandState('italic'));
                  setUnderlineActive(document.queryCommandState('underline'));
                  setSuperscriptActive(document.queryCommandState('superscript'));
                  setSubscriptActive(document.queryCommandState('subscript'));
                }, 10);
              }}
              className="flex-1 outline-none leading-relaxed text-base overflow-y-auto"
              style={{ 
                direction: 'ltr',
                textAlign: 'left',
                wordWrap: 'break-word'
              }}
              suppressContentEditableWarning={true}
            />
          </div>

          <div className="px-6 py-3 border-t bg-gray-50 text-right flex-shrink-0">
            <span className="text-sm text-gray-500">{wordCount} words</span>
          </div>
        </div>
        
        <div style={{ height: '15vh' }}></div>
      </div>

      <ShareModal
        noteId={noteId}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      <ExportModal
        noteId={noteId}
        noteTitle={title}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

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