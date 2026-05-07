import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudySession {
  id: string;
  subjects: string[];
  startTime: string;
  endTime: string | null;
  duration: number; // seconds
  isManual: boolean;
  coinsEarned: number;
}

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsed: number; // seconds
  activeSubjects: string[];
  sessionStart: string | null;
  sessions: StudySession[];

  startTimer: (subjects: string[]) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
  deleteSession: (id: string) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      isPaused: false,
      elapsed: 0,
      activeSubjects: [],
      sessionStart: null,
      sessions: [],

      startTimer: (subjects) => set({
        isRunning: true,
        isPaused: false,
        elapsed: 0,
        activeSubjects: subjects,
        sessionStart: new Date().toISOString(),
      }),

      pauseTimer: () => set({ isPaused: true }),

      resumeTimer: () => set({ isPaused: false }),

      stopTimer: () => {
        const state = get();
        if (state.elapsed < 5) {
          set({ isRunning: false, isPaused: false, elapsed: 0, activeSubjects: [], sessionStart: null });
          return;
        }
        const coinsEarned = Math.floor(state.elapsed / 60); // 1 coin per minute
        const session: StudySession = {
          id: crypto.randomUUID(),
          subjects: state.activeSubjects,
          startTime: state.sessionStart || new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: state.elapsed,
          isManual: false,
          coinsEarned,
        };
        set((s) => ({
          isRunning: false,
          isPaused: false,
          elapsed: 0,
          activeSubjects: [],
          sessionStart: null,
          sessions: [session, ...s.sessions],
        }));
      },

      tick: () => set((s) => ({ elapsed: s.elapsed + 1 })),

      deleteSession: (id) => set((s) => ({ sessions: s.sessions.filter(ses => ses.id !== id) })),
    }),
    { name: 'hash-timer-storage' }
  )
);
