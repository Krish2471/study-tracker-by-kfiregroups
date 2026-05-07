import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStorageKey } from '../lib/storage';
import { usePlannerStore } from './usePlannerStore';

export interface Exam {
  id: string;
  subject: string;
  date: string;
  title: string;
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
}

interface ExamState {
  exams: Exam[];
  goals: Goal[];
  addExam: (exam: Omit<Exam, 'id'>) => void;
  removeExam: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  removeGoal: (id: string) => void;
  toggleGoal: (id: string) => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      exams: [],
      goals: [],
      addExam: (exam) => {
        const id = crypto.randomUUID();
        const newExam = { ...exam, id };
        
        // Sync to planner
        usePlannerStore.getState().addEvent({
          id: `exam-${id}`,
          title: `Exam: ${exam.title}`,
          subject: exam.subject,
          date: exam.date,
          startTime: '09:00',
          endTime: '12:00',
          notes: 'Added from Exams page',
          color: '#991b1b', // Dark Red for exams
          sourceId: id,
          isExam: true
        });

        set((state) => ({
          exams: [...state.exams, newExam].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        }));
      },
      removeExam: (id) => {
        // Sync to planner
        usePlannerStore.getState().deleteEvent(`exam-${id}`);
        
        set((state) => ({
          exams: state.exams.filter((e) => e.id !== id)
        }));
      },
      addGoal: (goal) => {
        const id = crypto.randomUUID();
        const newGoal = { ...goal, id, completed: false };

        // Sync to planner
        usePlannerStore.getState().addEvent({
          id: `goal-${id}`,
          title: `Goal: ${goal.title}`,
          subject: 'Personal',
          date: goal.targetDate,
          startTime: '00:00',
          endTime: '23:59',
          notes: 'Added from Goals page',
          color: '#10b981',
          sourceId: id
        });

        set((state) => ({
          goals: [...state.goals, newGoal]
        }));
      },
      removeGoal: (id) => {
        // Sync to planner
        usePlannerStore.getState().deleteEvent(`goal-${id}`);
        
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id)
        }));
      },
      toggleGoal: (id) => {
        // Sync to planner
        const goal = useExamStore.getState().goals.find(g => g.id === id);
        if (goal) {
          usePlannerStore.getState().updateEvent(`goal-${id}`, { isCompleted: !goal.completed });
        }

        set((state) => ({
          goals: state.goals.map((g) => g.id === id ? { ...g, completed: !g.completed } : g)
        }));
      },
    }),
    { name: getStorageKey('hash-exams-storage') }
  )
);
