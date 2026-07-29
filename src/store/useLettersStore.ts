import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localStorage } from './storage';
import { Letter, LetterCategory } from '@/types';
import { generateId } from '@/utils/id';

interface LettersState {
  letters: Letter[];
  add: (title: string, body: string, category?: LetterCategory, scheduledFor?: number) => void;
  remove: (id: string) => void;
  markOpened: (id: string) => void;
}

export const useLettersStore = create<LettersState>()(
  persist(
    (set) => ({
      letters: [],
      add: (title, body, category = 'general', scheduledFor) =>
        set((s) => ({
          letters: [
            ...s.letters,
            { id: generateId(), title, body, createdAt: Date.now(), timesOpened: 0, category, scheduledFor },
          ],
        })),
      remove: (id) => set((s) => ({ letters: s.letters.filter((l) => l.id !== id) })),
      markOpened: (id) =>
        set((s) => ({
          letters: s.letters.map((l) => (l.id === id ? { ...l, timesOpened: l.timesOpened + 1 } : l)),
        })),
    }),
    { name: 'ebb.letters', storage: localStorage },
  ),
);
