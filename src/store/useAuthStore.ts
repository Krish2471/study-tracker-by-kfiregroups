import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebaseConfig';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  error: string | null;

  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  initAuthListener: () => () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isGuestMode: false,
      error: null,

      signInWithGoogle: async () => {
        if (!auth || !googleProvider) {
          set({ error: 'Firebase is not configured. Please use guest mode or set up Firebase credentials.' });
          return;
        }
        try {
          set({ isLoading: true, error: null });
          await signInWithPopup(auth, googleProvider);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Sign-in failed';
          set({ isLoading: false, error: message });
        }
      },

      signInAsGuest: () => {
        set({
          user: null,
          isAuthenticated: true,
          isGuestMode: true,
          isLoading: false,
        });
      },
      signOut: async () => {
        try {
          const state = useAuthStore.getState();
          if (!state.isGuestMode && auth) {
            await firebaseSignOut(auth);
          }
          
          // Toggle account ID to switch profiles on sign out
          const current = localStorage.getItem('hash-current-account-id') || 'account1';
          const next = current === 'account1' ? 'account2' : 'account1';
          localStorage.setItem('hash-current-account-id', next);
          
          // Clear session flag so it shows GetStarted again
          sessionStorage.removeItem('hash_session_launched');

          set({ user: null, isAuthenticated: false, isGuestMode: false });
          window.location.reload();
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Sign-out failed';
          set({ error: message });
        }
      },

      initAuthListener: () => {
        if (!isFirebaseConfigured || !auth) {
          // No Firebase config — just stop loading and let user choose
          set({ isLoading: false });
          return () => {};
        }
        try {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (useAuthStore.getState().isGuestMode) return;
            set({
              user,
              isAuthenticated: !!user,
              isLoading: false,
            });
          });
          return unsubscribe;
        } catch {
          console.warn('Firebase auth listener failed');
          set({ isLoading: false });
          return () => {};
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'hash-auth-storage' }
  )
);
