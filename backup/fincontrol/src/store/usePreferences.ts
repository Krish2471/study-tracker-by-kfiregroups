import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const SUPPORTED_CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'JPY'] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];

interface PreferencesState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      currency: 'USD',
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'preferences-storage',
    }
  )
);
