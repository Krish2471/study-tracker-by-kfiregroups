import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStorageKey } from '../lib/storage';

export interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  photoUrl: string; // base64 data URL
  grade: string;
  school: string;
  age: string;
  favoriteSubject: string;
  studyGoal: string; // e.g. "2 hours per day"
  emailReminders: boolean;
}

interface ProfileState {
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  setPhoto: (dataUrl: string) => void;
  clearProfile: () => void;
}

const DEFAULT_PROFILE: StudentProfile = {
  name: '',
  email: '',
  phone: '',
  bio: '',
  photoUrl: '',
  grade: '',
  school: '',
  age: '',
  favoriteSubject: '',
  studyGoal: '2 hours per day',
  emailReminders: false,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,

      updateProfile: (updates) =>
        set((s) => ({
          profile: { ...s.profile, ...updates },
        })),

      setPhoto: (dataUrl) =>
        set((s) => ({
          profile: { ...s.profile, photoUrl: dataUrl },
        })),

      clearProfile: () => set({ profile: DEFAULT_PROFILE }),
    }),
    { name: getStorageKey('hash-profile-storage') }
  )
);
