import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotebookStore } from '../store/useNotebookStore';
import { useSubjectsStore } from '../store/useSubjectsStore';
import {
  Plus, Search, Pin, PinOff, Trash2, Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Code, Quote, AlignLeft, ChevronLeft, Tag, X, Clock, FileText,
  Highlighter, Image as ImageIcon, Music, Paperclip, PenTool
} from 'lucide-react';
import { DrawingCanvas } from '../components/notebook/DrawingCanvas';
import { format } from 'date-fns';

export const NotebookPage = () => {
  const {
    notebooks, activeNotebookId, searchQuery,
    createNotebook, updateNotebook, deleteNotebook, togglePin,
    setActiveNotebook, setSearchQuery,
  } = useNotebookStore();
  const { subjects } = useSubjectsStore();

  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(subjects[0] || '');
  const [addingSubject, setAddingSubject] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showHighlighterPalette, setShowHighlighterPalette] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const highlighterBtnRef = useRef<HTMLButtonElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId);

  // Filter and sort notebooks
  const filteredNotebooks = notebooks
    .filter((n) => {
      if (filterSubject && n.subject !== filterSubject) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createNotebook(newSubject, newTitle.trim());
    setNewTitle('');
    setShowNewForm(false);
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleEditorInput = useCallback(() => {
    if (!activeNotebookId || !editorRef.current) return;
    const content = editorRef.current.innerHTML;

    // Debounced save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateNotebook(activeNotebookId, { content });
    }, 300); // Reduced from 500ms
  }, [activeNotebookId, updateNotebook]);

  const handleEditorBlur = () => {
    if (!activeNotebookId || !editorRef.current) return;
    updateNotebook(activeNotebookId, { content: editorRef.current.innerHTML });
  };


  // Set editor content when active notebook changes
  useEffect(() => {
    if (editorRef.current && activeNotebook) {
      if (editorRef.current.innerHTML !== activeNotebook.content) {
        editorRef.current.innerHTML = activeNotebook.content;
      }
    }
  }, [activeNotebookId]);

  const handleAddTag = () => {
    if (!tagInput.trim() || !activeNotebookId || !activeNotebook) return;
    const newTags = [...activeNotebook.tags, tagInput.trim()];
    updateNotebook(activeNotebookId, { tags: newTags });
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!activeNotebookId || !activeNotebook) return;
    updateNotebook(activeNotebookId, {
      tags: activeNotebook.tags.filter((t) => t !== tag),
    });
  };

  // Close palette on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node) && 
          highlighterBtnRef.current && !highlighterBtnRef.current.contains(event.target as Node)) {
        setShowHighlighterPalette(false);
      }
    };
    if (showHighlighterPalette) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHighlighterPalette]);

  const getWordCount = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ').trim();
    return text ? text.split(/\s+/).length : 0;
  };

  // Keyboard shortcuts
  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b': e.preventDefault(); execCommand('bold'); break;
        case 'i': e.preventDefault(); execCommand('italic'); break;
        case 'u': e.preventDefault(); execCommand('underline'); break;
      }
    }
    // Markdown-style shortcuts
    if (e.key === ' ' && editorRef.current) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const text = range.startContainer.textContent || '';
        const offset = range.startOffset;
        const lineStart = text.lastIndexOf('\n', offset - 1) + 1;
        const lineText = text.substring(lineStart, offset);

        if (lineText === '#') {
          e.preventDefault();
          range.startContainer.textContent = text.substring(0, lineStart) + text.substring(offset);
          execCommand('formatBlock', 'h1');
        } else if (lineText === '##') {
          e.preventDefault();
          range.startContainer.textContent = text.substring(0, lineStart) + text.substring(offset);
          execCommand('formatBlock', 'h2');
        } else if (lineText === '-') {
          e.preventDefault();
          range.startContainer.textContent = text.substring(0, lineStart) + text.substring(offset);
          execCommand('insertUnorderedList');
        }
      }
    }
  };

  const handleImportFile = (type: 'image' | 'audio' | 'file') => {
    const input = document.createElement('input');
    input.type = 'file';
    if (type === 'image') input.accept = 'image/*';
    else if (type === 'audio') input.accept = 'audio/*';
    
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file && activeNotebookId && activeNotebook) {
        const url = URL.createObjectURL(file);
        const newAttachment = {
          id: crypto.randomUUID(),
          type,
          url,
          name: file.name,
        };
        updateNotebook(activeNotebookId, {
          attachments: [...(activeNotebook.attachments || []), newAttachment]
        });
      }
    };
    input.click();
  };

  const handleRemoveAttachment = (id: string) => {
    if (!activeNotebookId || !activeNotebook) return;
    updateNotebook(activeNotebookId, {
      attachments: activeNotebook.attachments.filter(a => a.id !== id)
    });
  };

  const handleSaveDrawing = (dataUrl: string) => {
    if (!activeNotebookId || !activeNotebook) return;
    const newDrawing = {
      id: crypto.randomUUID(),
      dataUrl,
    };
    updateNotebook(activeNotebookId, {
      drawings: [...(activeNotebook.drawings || []), newDrawing]
    });
  };

  const handleRemoveDrawing = (id: string) => {
    if (!activeNotebookId || !activeNotebook) return;
    updateNotebook(activeNotebookId, {
      drawings: activeNotebook.drawings.filter(d => d.id !== id)
    });
  };

  const highlightColors = [
    { name: 'Yellow', color: '#fef08a' },
    { name: 'Green', color: '#bbf7d0' },
    { name: 'Blue', color: '#bfdbfe' },
    { name: 'Purple', color: '#e9d5ff' },
    { name: 'Pink', color: '#fbcfe8' },
    { name: 'Orange', color: '#fed7aa' },
    { name: 'Teal', color: '#99f6e4' },
    { name: 'Rose', color: '#fecdd3' },
    { name: 'Indigo', color: '#c7d2fe' },
    { name: 'Amber', color: '#fde68a' },
    { name: 'Lime', color: '#d9f99d' },
    { name: 'Cyan', color: '#a5f3fc' },
    { name: 'Clear', color: 'transparent', icon: X },
  ];


  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-4">
        <h1 className="text-2xl md:text-3xl font-black">Notebook</h1>
        <p className="text-text-muted text-sm mt-1">Take notes for each subject, Evernote-style</p>
      </header>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar - Note List */}
        <div className={`${activeNotebook && 'hidden md:flex'} w-full md:w-80 flex-shrink-0 flex flex-col glass rounded-2xl border border-border overflow-hidden`}>
          {/* Search + Filter */}
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              <button
                onClick={() => setFilterSubject(null)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                  !filterSubject ? 'bg-brand text-white' : 'bg-surface-hover text-text-muted'
                }`}
              >
                All
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setFilterSubject(sub)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                    filterSubject === sub ? 'bg-brand text-white' : 'bg-surface-hover text-text-muted'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* New Note Button */}
          <div className="p-3 border-b border-border">
            {showNewForm ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Note title..."
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm focus:ring-2 focus:ring-brand outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
                <select
                  value={newSubject}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setAddingSubject(true);
                    } else {
                      setNewSubject(e.target.value);
                      setAddingSubject(false);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="__add_new__">+ Other</option>
                </select>
                {addingSubject && (
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Type subject name..."
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand"
                    onBlur={() => {
                      if (customSubject.trim()) {
                        useSubjectsStore.getState().addSubject(customSubject.trim());
                        setNewSubject(customSubject.trim());
                      }
                      setAddingSubject(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customSubject.trim()) {
                        e.preventDefault();
                        useSubjectsStore.getState().addSubject(customSubject.trim());
                        setNewSubject(customSubject.trim());
                        setAddingSubject(false);
                      }
                    }}
                    autoFocus
                  />
                )}
                <div className="flex gap-2 mt-2">
                  <button onClick={handleCreate} className="flex-1 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition-colors">
                    Create
                  </button>
                  <button onClick={() => setShowNewForm(false)} className="px-3 py-2 text-xs font-bold text-text-muted hover:text-text rounded-xl transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewForm(true)}
                className="w-full py-2.5 bg-brand text-white font-bold text-sm rounded-xl hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> New Note
              </button>
            )}
          </div>

          {/* Note List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredNotebooks.length === 0 ? (
              <p className="text-center text-text-muted text-xs py-8">No notes yet. Create one!</p>
            ) : (
              filteredNotebooks.map((nb) => (
                <button
                  key={nb.id}
                  onClick={() => setActiveNotebook(nb.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    activeNotebookId === nb.id
                      ? 'bg-brand/10 border border-brand/20'
                      : 'hover:bg-surface-hover border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {nb.isPinned && <Pin size={10} className="text-warning flex-shrink-0" />}
                    <p className="font-bold text-sm truncate">{nb.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-md">{nb.subject}</span>
                    <span className="text-[10px] text-text-muted">{format(new Date(nb.updatedAt), 'MMM d')}</span>
                  </div>
                  <p className="text-[10px] text-text-muted truncate mt-1 line-clamp-1 italic">
                    {nb.content.replace(/<[^>]*>/g, '').substring(0, 50) || 'Empty note...'}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Editor Area */}
        {activeNotebook ? (
          <div className="flex-1 flex flex-col glass rounded-2xl border border-border overflow-hidden min-w-0">
            {/* Editor Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setActiveNotebook(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <input
                  type="text"
                  value={activeNotebook.title}
                  onChange={(e) => updateNotebook(activeNotebook.id, { title: e.target.value })}
                  className="flex-1 text-lg font-bold bg-transparent outline-none"
                />
                <button
                  onClick={() => togglePin(activeNotebook.id)}
                  className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-text-muted hover:text-warning"
                  title={activeNotebook.isPinned ? 'Unpin' : 'Pin'}
                >
                  {activeNotebook.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(activeNotebook.id)}
                  className="p-2 rounded-lg hover:bg-danger/10 transition-colors text-text-muted hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {activeNotebook.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold rounded-md">
                    <Tag size={10} />{tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-danger"><X size={10} /></button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tag..."
                  className="bg-transparent text-[10px] outline-none w-20"
                />
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border overflow-x-auto">
              {[
                { icon: Bold, cmd: 'bold', title: 'Bold (⌘B)' },
                { icon: Italic, cmd: 'italic', title: 'Italic (⌘I)' },
                { icon: Underline, cmd: 'underline', title: 'Underline (⌘U)' },
                null, // separator
                { icon: Heading1, cmd: 'formatBlock', val: 'h1', title: 'Heading 1' },
                { icon: Heading2, cmd: 'formatBlock', val: 'h2', title: 'Heading 2' },
                { icon: AlignLeft, cmd: 'formatBlock', val: 'p', title: 'Paragraph' },
                null,
                { icon: List, cmd: 'insertUnorderedList', title: 'Bullet List' },
                { icon: ListOrdered, cmd: 'insertOrderedList', title: 'Numbered List' },
                null,
                { icon: Code, cmd: 'formatBlock', val: 'pre', title: 'Code Block' },
                { icon: Quote, cmd: 'formatBlock', val: 'blockquote', title: 'Quote' },
              ].map((item, i) =>
                item === null ? (
                  <div key={`sep-${i}`} className="w-px h-5 bg-border mx-1" />
                ) : (
                  <button
                    key={item.cmd + (item.val || '')}
                    onClick={() => execCommand(item.cmd, item.val)}
                    title={item.title}
                    className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors"
                  >
                    <item.icon size={14} />
                  </button>
                )
              )}

              <div className="w-px h-5 bg-border mx-1" />
              
              <div className="relative">
                <button 
                  ref={highlighterBtnRef}
                  onClick={() => setShowHighlighterPalette(!showHighlighterPalette)} 
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${showHighlighterPalette ? 'bg-brand/10 text-brand' : 'text-text-muted hover:text-text hover:bg-surface-hover'}`}
                  title="Highlight Color Palette"
                >
                  <Highlighter size={14} />
                  <span className="text-[10px] font-black uppercase">Highlight</span>
                </button>
                
                <AnimatePresence>
                  {showHighlighterPalette && (
                    <motion.div 
                      ref={paletteRef}
                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 5 }}
                      className="absolute bottom-full left-0 mb-2 p-3 glass rounded-2xl border border-border shadow-2xl z-50 min-w-[280px]"
                    >
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Highlighter</span>
                        <button onClick={() => setShowHighlighterPalette(false)} className="p-1 hover:bg-surface-hover rounded-md transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1.5">
                        {highlightColors.map((hc) => (
                          <button
                            key={hc.name}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              editorRef.current?.focus();
                              execCommand('hiliteColor', hc.color);
                            }}
                            className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                            style={{ backgroundColor: hc.color === 'transparent' ? 'transparent' : hc.color }}
                            title={hc.name}
                          >
                            {hc.icon && <hc.icon size={14} className="text-text-muted" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-px h-5 bg-border mx-1" />
              <button onClick={() => handleImportFile('image')} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors" title="Import Image">
                <ImageIcon size={14} />
              </button>
              <button onClick={() => handleImportFile('audio')} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors" title="Import Audio">
                <Music size={14} />
              </button>
              <button onClick={() => handleImportFile('file')} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors" title="Import File">
                <Paperclip size={14} />
              </button>
              <div className="w-px h-5 bg-border mx-1" />
              <button onClick={() => setIsDrawingMode(true)} className="p-1.5 rounded-lg hover:bg-brand/10 text-brand transition-colors flex items-center gap-1" title="Scribble / Hand-draw">
                <PenTool size={14} />
                <span className="text-[10px] font-black uppercase">Scribble</span>
              </button>
            </div>

            {/* Drawing Overlay */}
            {isDrawingMode && (
              <div className="absolute inset-0 z-40 bg-surface/90 backdrop-blur-md">
                <DrawingCanvas onSave={handleSaveDrawing} onClose={() => setIsDrawingMode(false)} />
              </div>
            )}

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              onBlur={handleEditorBlur}
              onKeyDown={handleEditorKeyDown}
              className="flex-1 overflow-y-auto p-5 outline-none prose-editor text-sm leading-relaxed"
              data-placeholder="Start typing your notes..."
              suppressContentEditableWarning
            />

            {/* Drawings Section */}
            {activeNotebook.drawings && activeNotebook.drawings.length > 0 && (
              <div className="px-5 py-4 border-t border-border bg-surface/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Drawings</p>
                <div className="flex flex-wrap gap-4">
                  {activeNotebook.drawings.map(drawing => (
                    <div key={drawing.id} className="relative group rounded-xl border border-border bg-white overflow-hidden max-w-[300px]">
                      <img src={drawing.dataUrl} alt="Drawing" className="max-h-[200px] object-contain" />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleRemoveDrawing(drawing.id)}
                          className="p-1.5 rounded-lg bg-danger text-white shadow-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments Section */}
            {activeNotebook.attachments && activeNotebook.attachments.length > 0 && (
              <div className="px-5 py-4 border-t border-border bg-surface/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Attachments</p>
                <div className="flex flex-wrap gap-3">
                  {activeNotebook.attachments.map(att => (
                    <div key={att.id} className="relative group p-2 rounded-xl border border-border bg-surface flex items-center gap-3 min-w-[150px]">
                      {att.type === 'image' && <ImageIcon size={16} className="text-brand" />}
                      {att.type === 'audio' && <Music size={16} className="text-accent" />}
                      {att.type === 'file' && <FileText size={16} className="text-text-muted" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold truncate">{att.name}</p>
                        <a href={att.url} target="_blank" rel="noreferrer" className="text-[9px] text-brand hover:underline">View</a>
                      </div>
                      <button 
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1 rounded-md hover:bg-danger/10 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[10px] text-text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><FileText size={10} />{getWordCount(activeNotebook.content)} words</span>
                <span className="flex items-center gap-1"><Clock size={10} />Edited {format(new Date(activeNotebook.updatedAt), 'MMM d, h:mm a')}</span>
              </div>
              <span className="font-bold text-brand">{activeNotebook.subject}</span>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center glass rounded-2xl border border-border">
            <div className="text-center">
              <FileText size={48} className="mx-auto text-text-muted/30 mb-3" />
              <p className="text-text-muted text-sm font-semibold">Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 border border-border max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-2">Delete Note?</h3>
              <p className="text-text-muted text-sm mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteNotebook(showDeleteConfirm);
                    setShowDeleteConfirm(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-danger text-white font-semibold text-sm hover:bg-danger/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
