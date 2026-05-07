import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ExpenseCategory = 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Entertainment' | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number; // Always stored in base currency (USD)
  category: ExpenseCategory | string;
  date: string; // ISO String
  notes?: string;
}

interface ExpensesState {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  editExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

export const useExpenses = create<ExpensesState>()(
  persist(
    (set) => ({
      expenses: [],
      addExpense: (expenseData) => set((state) => ({
        expenses: [{ ...expenseData, id: crypto.randomUUID() }, ...state.expenses],
      })),
      editExpense: (id, updatedData) => set((state) => ({
        expenses: state.expenses.map((e) => e.id === id ? { ...e, ...updatedData } : e),
      })),
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
      })),
    }),
    {
      name: 'expenses-storage',
    }
  )
);
