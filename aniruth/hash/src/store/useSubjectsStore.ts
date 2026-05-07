import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStorageKey } from '../lib/storage';

export const DEFAULT_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'History', 'Computer Science', 'Economics',
];

export interface SubjectGoal {
  subject: string;
  weeklyGoalMinutes: number;
}

interface SubjectsState {
  subjects: string[];
  goals: SubjectGoal[];
  addSubject: (name: string) => void;
  removeSubject: (name: string) => void;
  setGoal: (subject: string, weeklyMinutes: number) => void;
}

export const useSubjectsStore = create<SubjectsState>()(
  persist(
    (set) => ({
      subjects: DEFAULT_SUBJECTS,
      goals: [],

      addSubject: (name) => set((s) => ({
        subjects: s.subjects.includes(name) ? s.subjects : [...s.subjects, name],
      })),

      removeSubject: (name) => set((s) => ({
        subjects: s.subjects.filter(sub => sub !== name),
        goals: s.goals.filter(g => g.subject !== name),
      })),

      setGoal: (subject, weeklyMinutes) => set((s) => ({
        goals: [
          ...s.goals.filter(g => g.subject !== subject),
          { subject, weeklyGoalMinutes: weeklyMinutes },
        ],
      })),
    }),
    { name: getStorageKey('hash-subjects-storage') }
  )
);
