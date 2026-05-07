import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStorageKey } from '../lib/storage';

export interface AvatarItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  category: 'hat' | 'face' | 'accessory' | 'background';
  levelRequired: number;
}

export const AVATAR_SHOP: AvatarItem[] = [
  // Hats
  { id: 'hat-cap', name: 'Study Cap', emoji: '🧢', cost: 10, category: 'hat', levelRequired: 1 },
  { id: 'hat-grad', name: 'Graduation Cap', emoji: '🎓', cost: 50, category: 'hat', levelRequired: 3 },
  { id: 'hat-crown', name: 'Royal Crown', emoji: '👑', cost: 200, category: 'hat', levelRequired: 7 },
  { id: 'hat-wizard', name: 'Wizard Hat', emoji: '🧙', cost: 100, category: 'hat', levelRequired: 5 },
  // Face
  { id: 'face-glasses', name: 'Smart Glasses', emoji: '🤓', cost: 15, category: 'face', levelRequired: 1 },
  { id: 'face-shades', name: 'Cool Shades', emoji: '😎', cost: 30, category: 'face', levelRequired: 2 },
  { id: 'face-monocle', name: 'Monocle', emoji: '🧐', cost: 75, category: 'face', levelRequired: 4 },
  // Accessories
  { id: 'acc-star', name: 'Gold Star', emoji: '⭐', cost: 25, category: 'accessory', levelRequired: 2 },
  { id: 'acc-trophy', name: 'Trophy', emoji: '🏆', cost: 150, category: 'accessory', levelRequired: 6 },
  { id: 'acc-medal', name: 'Medal', emoji: '🏅', cost: 60, category: 'accessory', levelRequired: 3 },
  { id: 'acc-rocket', name: 'Rocket', emoji: '🚀', cost: 120, category: 'accessory', levelRequired: 5 },
  // Backgrounds
  { id: 'bg-fire', name: 'Fire Aura', emoji: '🔥', cost: 40, category: 'background', levelRequired: 2 },
  { id: 'bg-sparkle', name: 'Sparkle', emoji: '✨', cost: 80, category: 'background', levelRequired: 4 },
  { id: 'bg-rainbow', name: 'Rainbow', emoji: '🌈', cost: 180, category: 'background', levelRequired: 6 },
  { id: 'bg-galaxy', name: 'Galaxy', emoji: '🌌', cost: 250, category: 'background', levelRequired: 8 },
];

export const LEVELS = [
  { level: 1, name: 'Novice', xpRequired: 0, emoji: '🌱' },
  { level: 2, name: 'Learner', xpRequired: 60, emoji: '📗' },
  { level: 3, name: 'Student', xpRequired: 180, emoji: '📘' },
  { level: 4, name: 'Scholar', xpRequired: 360, emoji: '📙' },
  { level: 5, name: 'Expert', xpRequired: 600, emoji: '🧠' },
  { level: 6, name: 'Master', xpRequired: 900, emoji: '🎯' },
  { level: 7, name: 'Sage', xpRequired: 1500, emoji: '🔮' },
  { level: 8, name: 'Guru', xpRequired: 2400, emoji: '💎' },
  { level: 9, name: 'Legend', xpRequired: 3600, emoji: '⚡' },
  { level: 10, name: 'Transcendent', xpRequired: 5000, emoji: '👾' },
];

interface GameState {
  coins: number;
  totalXP: number; // total study minutes
  ownedItems: string[];
  equippedItems: { hat?: string; face?: string; accessory?: string; background?: string };
  streak: number;
  lastStudyDate: string | null;

  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addXP: (minutes: number) => void;
  buyItem: (itemId: string) => boolean;
  equipItem: (itemId: string, category: 'hat' | 'face' | 'accessory' | 'background') => void;
  unequipItem: (category: 'hat' | 'face' | 'accessory' | 'background') => void;
  updateStreak: () => void;
  getLevel: () => { level: number; name: string; emoji: string; xpRequired: number; nextLevelXP: number | null; progress: number };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 0,
      totalXP: 0,
      ownedItems: [],
      equippedItems: {},
      streak: 0,
      lastStudyDate: null,

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

      spendCoins: (amount) => {
        const state = get();
        if (state.coins < amount) return false;
        set({ coins: state.coins - amount });
        return true;
      },

      addXP: (minutes) => set((s) => ({ totalXP: s.totalXP + minutes })),

      buyItem: (itemId) => {
        const state = get();
        const item = AVATAR_SHOP.find(i => i.id === itemId);
        if (!item) return false;
        if (state.ownedItems.includes(itemId)) return false;
        if (state.coins < item.cost) return false;
        
        const level = get().getLevel();
        if (level.level < item.levelRequired) return false;

        set({
          coins: state.coins - item.cost,
          ownedItems: [...state.ownedItems, itemId],
        });
        return true;
      },

      equipItem: (itemId, category) => set((s) => ({
        equippedItems: { ...s.equippedItems, [category]: itemId },
      })),

      unequipItem: (category) => set((s) => {
        const eq = { ...s.equippedItems };
        delete eq[category];
        return { equippedItems: eq };
      }),

      updateStreak: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.lastStudyDate === today) return;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (state.lastStudyDate === yesterday.toDateString()) {
          set({ streak: state.streak + 1, lastStudyDate: today });
        } else {
          set({ streak: 1, lastStudyDate: today });
        }
      },

      getLevel: () => {
        const xp = get().totalXP;
        let currentLevel = LEVELS[0];
        for (const l of LEVELS) {
          if (xp >= l.xpRequired) currentLevel = l;
          else break;
        }
        const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
        const progress = nextLevel
          ? ((xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
          : 100;
        return { ...currentLevel, nextLevelXP: nextLevel?.xpRequired ?? null, progress: Math.min(progress, 100) };
      },
    }),
    { name: getStorageKey('hash-game-storage') }
  )
);
