import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStorageKey } from '../lib/storage';

export interface PlannerEvent {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isCompleted: boolean;
  color: string;
  notes: string;
  createdAt: string;
  sourceId?: string; // ID of the exam or goal this event was created from
  isExam?: boolean;
}

interface PlannerState {
  events: PlannerEvent[];
  selectedDate: string; // YYYY-MM-DD
  viewMode: 'month' | 'week' | 'day';

  addEvent: (event: Omit<PlannerEvent, 'id' | 'createdAt' | 'isCompleted'> & { id?: string }) => void;
  updateEvent: (id: string, updates: Partial<PlannerEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleComplete: (id: string) => void;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
}

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#8b5cf6',
  Physics: '#06b6d4',
  Chemistry: '#10b981',
  Biology: '#f59e0b',
  English: '#ef4444',
  History: '#ec4899',
  'Computer Science': '#6366f1',
  Economics: '#14b8a6',
};

export const getSubjectColor = (subject: string): string => {
  if (SUBJECT_COLORS[subject]) return SUBJECT_COLORS[subject];
  // Generate a consistent color from subject name
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 55%)`;
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      events: [],
      selectedDate: new Date().toISOString().split('T')[0],
      viewMode: 'month',

      addEvent: (eventData) => {
        const event: PlannerEvent = {
          ...eventData,
          id: eventData.id || crypto.randomUUID(),
          isCompleted: false,
          createdAt: new Date().toISOString(),
          isExam: eventData.isExam || false,
        };
        set((s) => ({ events: [...s.events, event] }));
      },

      updateEvent: (id, updates) => set((s) => ({
        events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      })),

      deleteEvent: (id) => set((s) => ({
        events: s.events.filter((e) => e.id !== id),
      })),

      toggleComplete: (id) => set((s) => ({
        events: s.events.map((e) =>
          e.id === id ? { ...e, isCompleted: !e.isCompleted } : e
        ),
      })),

      setSelectedDate: (date) => set({ selectedDate: date }),

      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    { name: getStorageKey('hash-planner-storage') }
  )
);
