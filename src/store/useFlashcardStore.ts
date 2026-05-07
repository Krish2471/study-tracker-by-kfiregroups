import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStorageKey } from '../lib/storage';

export interface FlashCard {
  id: string;
  front: string;
  back: string;
  difficulty: 'new' | 'learning' | 'review' | 'mastered';
  nextReview: string; // ISO date
  interval: number; // days
  repetitions: number;
  easeFactor: number; // SM-2 ease factor
  createdAt: string;
}

export interface FlashcardDeck {
  id: string;
  subject: string;
  title: string;
  cards: FlashCard[];
  createdAt: string;
  updatedAt: string;
}

type Rating = 0 | 1 | 2 | 3 | 4 | 5; // 0=again, 1-2=hard, 3=good, 4-5=easy

interface FlashcardState {
  decks: FlashcardDeck[];
  activeDeckId: string | null;
  studyIndex: number;
  isStudying: boolean;
  isFlipped: boolean;

  createDeck: (subject: string, title: string) => string;
  deleteDeck: (id: string) => void;
  addCard: (deckId: string, front: string, back: string) => void;
  updateCard: (deckId: string, cardId: string, updates: Partial<Pick<FlashCard, 'front' | 'back'>>) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  rateCard: (deckId: string, cardId: string, rating: Rating) => void;
  setActiveDeck: (id: string | null) => void;
  startStudy: (deckId: string) => void;
  nextCard: () => void;
  flipCard: () => void;
  stopStudy: () => void;
  startSubjectStudy: (subject: string) => void;
  getDueCards: (deckId: string) => FlashCard[];
  getAllDueCards: () => FlashCard[];
  getDeckStats: (deckId: string) => { total: number; due: number; mastered: number; learning: number; newCards: number };
  getSubjectStats: (subject: string) => { total: number; due: number; mastered: number };
}

// SM-2 Algorithm
function sm2(card: FlashCard, rating: Rating): Partial<FlashCard> {
  let { repetitions, easeFactor, interval } = card;
  const now = new Date();

  if (rating < 3) {
    // Failed: reset
    repetitions = 0;
    interval = 1;
    return {
      repetitions,
      interval,
      easeFactor,
      difficulty: 'learning' as const,
      nextReview: new Date(now.getTime() + interval * 86400000).toISOString(),
    };
  }

  // Passed
  if (repetitions === 0) {
    interval = 1;
  } else if (repetitions === 1) {
    interval = 6;
  } else {
    interval = Math.round(interval * easeFactor);
  }

  repetitions += 1;
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));

  let difficulty: FlashCard['difficulty'] = 'review';
  if (repetitions >= 5 && interval >= 21) {
    difficulty = 'mastered';
  } else if (repetitions >= 1) {
    difficulty = 'review';
  }

  return {
    repetitions,
    interval,
    easeFactor,
    difficulty,
    nextReview: new Date(now.getTime() + interval * 86400000).toISOString(),
  };
}

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set, get) => ({
      decks: [],
      activeDeckId: null,
      studyIndex: 0,
      isStudying: false,
      isFlipped: false,

      createDeck: (subject, title) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const deck: FlashcardDeck = {
          id,
          subject,
          title,
          cards: [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ decks: [deck, ...s.decks] }));
        return id;
      },

      deleteDeck: (id) => set((s) => ({
        decks: s.decks.filter((d) => d.id !== id),
        activeDeckId: s.activeDeckId === id ? null : s.activeDeckId,
      })),

      addCard: (deckId, front, back) => set((s) => ({
        decks: s.decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                updatedAt: new Date().toISOString(),
                cards: [
                  ...d.cards,
                  {
                    id: crypto.randomUUID(),
                    front,
                    back,
                    difficulty: 'new' as const,
                    nextReview: new Date().toISOString(),
                    interval: 0,
                    repetitions: 0,
                    easeFactor: 2.5,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : d
        ),
      })),

      updateCard: (deckId, cardId, updates) => set((s) => ({
        decks: s.decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                updatedAt: new Date().toISOString(),
                cards: d.cards.map((c) =>
                  c.id === cardId ? { ...c, ...updates } : c
                ),
              }
            : d
        ),
      })),

      deleteCard: (deckId, cardId) => set((s) => ({
        decks: s.decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                updatedAt: new Date().toISOString(),
                cards: d.cards.filter((c) => c.id !== cardId),
              }
            : d
        ),
      })),

      rateCard: (deckId: string, cardId: string, rating: Rating) => set((s) => ({
        decks: s.decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                cards: d.cards.map((c) =>
                  c.id === cardId ? { ...c, ...sm2(c, rating) } : c
                ),
              }
            : d
        ),
      })),

      setActiveDeck: (id) => set({ activeDeckId: id }),

      startStudy: (deckId) => set({
        activeDeckId: deckId,
        isStudying: true,
        studyIndex: 0,
        isFlipped: false,
      }),

      nextCard: () => set((s) => ({
        studyIndex: s.studyIndex + 1,
        isFlipped: false,
      })),

      flipCard: () => set((s) => ({ isFlipped: !s.isFlipped })),

      stopStudy: () => set({
        isStudying: false,
        studyIndex: 0,
        isFlipped: false,
      }),

      getDueCards: (deckId) => {
        const deck = get().decks.find((d) => d.id === deckId);
        if (!deck) return [];
        const now = new Date();
        return deck.cards.filter(
          (c) => c.difficulty === 'new' || new Date(c.nextReview) <= now
        );
      },

      getAllDueCards: () => {
        const now = new Date();
        return get().decks.flatMap(d => d.cards.filter(c => c.difficulty === 'new' || new Date(c.nextReview) <= now));
      },

      startSubjectStudy: (subject) => {
        const now = new Date();
        const subjectCards = get().decks
          .filter(d => d.subject === subject)
          .flatMap(d => d.cards.filter(c => c.difficulty === 'new' || new Date(c.nextReview) <= now));
        
        if (subjectCards.length > 0) {
          set({
            activeDeckId: `subject-${subject}`,
            isStudying: true,
            studyIndex: 0,
            isFlipped: false,
          });
        }
      },

      getDeckStats: (deckId) => {
        const deck = get().decks.find((d) => d.id === deckId);
        if (!deck) return { total: 0, due: 0, mastered: 0, learning: 0, newCards: 0 };
        const now = new Date();
        return {
          total: deck.cards.length,
          due: deck.cards.filter((c) => c.difficulty === 'new' || new Date(c.nextReview) <= now).length,
          mastered: deck.cards.filter((c) => c.difficulty === 'mastered').length,
          learning: deck.cards.filter((c) => c.difficulty === 'learning' || c.difficulty === 'review').length,
          newCards: deck.cards.filter((c) => c.difficulty === 'new').length,
        };
      },

      getSubjectStats: (subject) => {
        const subjectDecks = get().decks.filter(d => d.subject === subject);
        const allCards = subjectDecks.flatMap(d => d.cards);
        const now = new Date();
        return {
          total: allCards.length,
          due: allCards.filter(c => c.difficulty === 'new' || new Date(c.nextReview) <= now).length,
          mastered: allCards.filter(c => c.difficulty === 'mastered').length,
        };
      },
    }),
    { name: getStorageKey('hash-flashcard-storage') }
  )
);
