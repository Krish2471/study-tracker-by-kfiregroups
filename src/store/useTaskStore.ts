import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStorageKey } from '../lib/storage';
import { usePlannerStore } from './usePlannerStore';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface TaskState {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (title) => {
        const id = crypto.randomUUID();
        const date = new Date().toISOString().split('T')[0];
        
        // Sync to planner
        usePlannerStore.getState().addEvent({
          id: `task-${id}`,
          title: `Task: ${title}`,
          subject: 'General',
          date,
          startTime: '00:00',
          endTime: '23:59',
          notes: 'Added from Tasks',
          color: '#064e3b', // Dark Green for tasks
          sourceId: id
        });

        set((state) => ({
          tasks: [
            {
              id,
              title,
              completed: false,
              createdAt: new Date().toISOString(),
            },
            ...state.tasks,
          ],
        }));
      },

      toggleTask: (id) => {
        const task = useTaskStore.getState().tasks.find(t => t.id === id);
        if (task) {
          usePlannerStore.getState().updateEvent(`task-${id}`, { isCompleted: !task.completed });
        }
        
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }));
      },

      deleteTask: (id) => {
        usePlannerStore.getState().deleteEvent(`task-${id}`);
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      clearCompleted: () =>
        set((state) => ({
          tasks: state.tasks.filter((t) => !t.completed),
        })),
    }),
    { name: getStorageKey('hash-tasks-storage') }
  )
);
