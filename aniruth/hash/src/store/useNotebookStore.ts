import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStorageKey } from '../lib/storage';

export interface Drawing {
  id: string;
  dataUrl: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'file';
  url: string;
  name: string;
}

export interface Notebook {
  id: string;
  subject: string;
  title: string;
  content: string; // HTML content
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  attachments: Attachment[];
  drawings: Drawing[];
}

interface NotebookState {
  notebooks: Notebook[];
  activeNotebookId: string | null;
  searchQuery: string;

  createNotebook: (subject: string, title: string) => string;
  updateNotebook: (id: string, updates: Partial<Pick<Notebook, 'title' | 'content' | 'tags' | 'subject' | 'attachments' | 'drawings'>>) => void;
  deleteNotebook: (id: string) => void;
  togglePin: (id: string) => void;
  setActiveNotebook: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useNotebookStore = create<NotebookState>()(
  persist(
    (set) => ({
      notebooks: [],
      activeNotebookId: null,
      searchQuery: '',

      createNotebook: (subject, title) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const notebook: Notebook = {
          id,
          subject,
          title,
          content: '',
          tags: [],
          createdAt: now,
          updatedAt: now,
          isPinned: false,
          attachments: [],
          drawings: [],
        };
        set((s) => ({
          notebooks: [notebook, ...s.notebooks],
          activeNotebookId: id,
        }));
        return id;
      },

      updateNotebook: (id, updates) => set((s) => ({
        notebooks: s.notebooks.map((n) =>
          n.id === id
            ? { ...n, ...updates, updatedAt: new Date().toISOString() }
            : n
        ),
      })),

      deleteNotebook: (id) => set((s) => ({
        notebooks: s.notebooks.filter((n) => n.id !== id),
        activeNotebookId: s.activeNotebookId === id ? null : s.activeNotebookId,
      })),

      togglePin: (id) => set((s) => ({
        notebooks: s.notebooks.map((n) =>
          n.id === id ? { ...n, isPinned: !n.isPinned } : n
        ),
      })),

      setActiveNotebook: (id) => set({ activeNotebookId: id }),

      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    { name: getStorageKey('hash-notebook-storage') }
  )
);
