import { useEffect, useRef } from 'react';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { useAuthStore } from '../store/useAuthStore';
import { useTimerStore } from '../store/useTimerStore';
import { useGameStore } from '../store/useGameStore';
import { useSubjectsStore } from '../store/useSubjectsStore';
import { useNotebookStore } from '../store/useNotebookStore';
import { usePlannerStore } from '../store/usePlannerStore';
import { useFlashcardStore } from '../store/useFlashcardStore';

export function useSyncService() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuestMode = useAuthStore((s) => s.isGuestMode);
  const unsubscribesRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    // Skip sync when not authenticated or when Firebase isn't configured
    if (!isAuthenticated || !user || !db) return;

    const firestore = db; // narrowed to non-null Firestore
    const uid = user.uid;

    // Initial sync: merge local → cloud, then listen for changes
    const initSync = async () => {
      try {
        // Sync game state
        const gameRef = doc(firestore, 'users', uid, 'data', 'gameState');
        const gameSnap = await getDoc(gameRef);
        const localGame = useGameStore.getState();

        if (gameSnap.exists()) {
          const cloudGame = gameSnap.data();
          // Cloud wins for most fields, but merge owned items
          const mergedOwned = [...new Set([...(cloudGame.ownedItems || []), ...localGame.ownedItems])];
          useGameStore.setState({
            coins: Math.max(cloudGame.coins || 0, localGame.coins),
            totalXP: Math.max(cloudGame.totalXP || 0, localGame.totalXP),
            ownedItems: mergedOwned,
            equippedItems: cloudGame.equippedItems || localGame.equippedItems,
            streak: Math.max(cloudGame.streak || 0, localGame.streak),
            lastStudyDate: cloudGame.lastStudyDate || localGame.lastStudyDate,
          });
        }
        // Write merged state to cloud
        await setDoc(gameRef, {
          coins: useGameStore.getState().coins,
          totalXP: useGameStore.getState().totalXP,
          ownedItems: useGameStore.getState().ownedItems,
          equippedItems: useGameStore.getState().equippedItems,
          streak: useGameStore.getState().streak,
          lastStudyDate: useGameStore.getState().lastStudyDate,
        });

        // Sync subjects
        const subjectsRef = doc(firestore, 'users', uid, 'data', 'subjects');
        const subSnap = await getDoc(subjectsRef);
        const localSub = useSubjectsStore.getState();

        if (subSnap.exists()) {
          const cloudSub = subSnap.data();
          const mergedSubjects = [...new Set([...(cloudSub.subjects || []), ...localSub.subjects])];
          useSubjectsStore.setState({
            subjects: mergedSubjects,
            goals: cloudSub.goals || localSub.goals,
          });
        }
        await setDoc(subjectsRef, {
          subjects: useSubjectsStore.getState().subjects,
          goals: useSubjectsStore.getState().goals,
        });

        // Sync sessions
        const sessionsRef = doc(firestore, 'users', uid, 'data', 'sessions');
        const sessSnap = await getDoc(sessionsRef);
        const localTimer = useTimerStore.getState();

        if (sessSnap.exists()) {
          const cloudSessions = sessSnap.data().sessions || [];
          const localIds = new Set(localTimer.sessions.map((s: { id: string }) => s.id));
          const merged = [
            ...localTimer.sessions,
            ...cloudSessions.filter((s: { id: string }) => !localIds.has(s.id)),
          ].sort((a: { startTime: string }, b: { startTime: string }) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );
          useTimerStore.setState({ sessions: merged });
          // Remove duplicates
          const seen = new Set();
          const deduped = merged.filter((s: { id: string }) => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
          });
          useTimerStore.setState({ sessions: deduped });
        }
        await setDoc(sessionsRef, { sessions: useTimerStore.getState().sessions });

        // Sync notebooks
        const notebooksRef = doc(firestore, 'users', uid, 'data', 'notebooks');
        const nbSnap = await getDoc(notebooksRef);
        const localNb = useNotebookStore.getState();
        if (nbSnap.exists()) {
          const cloudNb = nbSnap.data();
          const localIds = new Set(localNb.notebooks.map((n: { id: string }) => n.id));
          const merged = [
            ...localNb.notebooks,
            ...(cloudNb.notebooks || []).filter((n: { id: string }) => !localIds.has(n.id)),
          ];
          useNotebookStore.setState({ notebooks: merged });
        }
        await setDoc(notebooksRef, { notebooks: useNotebookStore.getState().notebooks });

        // Sync planner
        const plannerRef = doc(firestore, 'users', uid, 'data', 'planner');
        const plSnap = await getDoc(plannerRef);
        const localPl = usePlannerStore.getState();
        if (plSnap.exists()) {
          const cloudPl = plSnap.data();
          const localIds = new Set(localPl.events.map((e: { id: string }) => e.id));
          const merged = [
            ...localPl.events,
            ...(cloudPl.events || []).filter((e: { id: string }) => !localIds.has(e.id)),
          ];
          usePlannerStore.setState({ events: merged });
        }
        await setDoc(plannerRef, { events: usePlannerStore.getState().events });

        // Sync flashcards
        const flashRef = doc(firestore, 'users', uid, 'data', 'flashcards');
        const flSnap = await getDoc(flashRef);
        const localFl = useFlashcardStore.getState();
        if (flSnap.exists()) {
          const cloudFl = flSnap.data();
          const localIds = new Set(localFl.decks.map((d: { id: string }) => d.id));
          const merged = [
            ...localFl.decks,
            ...(cloudFl.decks || []).filter((d: { id: string }) => !localIds.has(d.id)),
          ];
          useFlashcardStore.setState({ decks: merged });
        }
        await setDoc(flashRef, { decks: useFlashcardStore.getState().decks });

        // Set up real-time listeners
        setupListeners(uid);
      } catch (err) {
        console.error('Sync error:', err);
      }
    };

    const setupListeners = (uid: string) => {
      // Listen for game state changes
      const unsub1 = onSnapshot(doc(firestore, 'users', uid, 'data', 'gameState'), (snap) => {
        if (snap.exists() && snap.metadata.hasPendingWrites === false) {
          const data = snap.data();
          useGameStore.setState({
            coins: data.coins,
            totalXP: data.totalXP,
            ownedItems: data.ownedItems,
            equippedItems: data.equippedItems,
            streak: data.streak,
            lastStudyDate: data.lastStudyDate,
          });
        }
      });

      // Listen for sessions
      const unsub2 = onSnapshot(doc(firestore, 'users', uid, 'data', 'sessions'), (snap) => {
        if (snap.exists() && snap.metadata.hasPendingWrites === false) {
          useTimerStore.setState({ sessions: snap.data().sessions || [] });
        }
      });

      // Listen for subjects
      const unsub3 = onSnapshot(doc(firestore, 'users', uid, 'data', 'subjects'), (snap) => {
        if (snap.exists() && snap.metadata.hasPendingWrites === false) {
          const data = snap.data();
          useSubjectsStore.setState({
            subjects: data.subjects,
            goals: data.goals,
          });
        }
      });

      // Listen for notebooks
      const unsub4 = onSnapshot(doc(firestore, 'users', uid, 'data', 'notebooks'), (snap) => {
        if (snap.exists() && snap.metadata.hasPendingWrites === false) {
          useNotebookStore.setState({ notebooks: snap.data().notebooks || [] });
        }
      });

      // Listen for planner
      const unsub5 = onSnapshot(doc(firestore, 'users', uid, 'data', 'planner'), (snap) => {
        if (snap.exists() && snap.metadata.hasPendingWrites === false) {
          usePlannerStore.setState({ events: snap.data().events || [] });
        }
      });

      // Listen for flashcards
      const unsub6 = onSnapshot(doc(firestore, 'users', uid, 'data', 'flashcards'), (snap) => {
        if (snap.exists() && snap.metadata.hasPendingWrites === false) {
          useFlashcardStore.setState({ decks: snap.data().decks || [] });
        }
      });

      unsubscribesRef.current = [unsub1, unsub2, unsub3, unsub4, unsub5, unsub6];
    };

    initSync();

    // Subscribe to local store changes and push to cloud
    const unsubGame = useGameStore.subscribe((state) => {
      if (!user) return;
      setDoc(doc(firestore, 'users', user.uid, 'data', 'gameState'), {
        coins: state.coins,
        totalXP: state.totalXP,
        ownedItems: state.ownedItems,
        equippedItems: state.equippedItems,
        streak: state.streak,
        lastStudyDate: state.lastStudyDate,
      }).catch(console.error);
    });

    const unsubTimer = useTimerStore.subscribe((state) => {
      if (!user || state.isRunning) return; // Don't sync while timer is running
      setDoc(doc(firestore, 'users', user.uid, 'data', 'sessions'), {
        sessions: state.sessions,
      }).catch(console.error);
    });

    const unsubSub = useSubjectsStore.subscribe((state) => {
      if (!user) return;
      setDoc(doc(firestore, 'users', user.uid, 'data', 'subjects'), {
        subjects: state.subjects,
        goals: state.goals,
      }).catch(console.error);
    });

    const unsubNb = useNotebookStore.subscribe((state) => {
      if (!user) return;
      setDoc(doc(firestore, 'users', user.uid, 'data', 'notebooks'), {
        notebooks: state.notebooks,
      }).catch(console.error);
    });

    const unsubPl = usePlannerStore.subscribe((state) => {
      if (!user) return;
      setDoc(doc(firestore, 'users', user.uid, 'data', 'planner'), {
        events: state.events,
      }).catch(console.error);
    });

    const unsubFl = useFlashcardStore.subscribe((state) => {
      if (!user) return;
      setDoc(doc(firestore, 'users', user.uid, 'data', 'flashcards'), {
        decks: state.decks,
      }).catch(console.error);
    });

    return () => {
      unsubscribesRef.current.forEach(fn => fn());
      unsubscribesRef.current = [];
      unsubGame();
      unsubTimer();
      unsubSub();
      unsubNb();
      unsubPl();
      unsubFl();
    };
  }, [isAuthenticated, user, isGuestMode]);
}
