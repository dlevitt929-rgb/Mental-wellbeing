import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localStorage } from './storage';
import { JournalEntry, Mood } from '@/types';
import { generateId } from '@/utils/id';

interface JournalState {
  entries: JournalEntry[];
  /** Creates the entry immediately (autosave from the first keystroke) and returns its id. */
  create: (text: string, mood?: Mood) => string;
  update: (id: string, patch: Partial<Pick<JournalEntry, 'text' | 'mood'>>) => void;
  remove: (id: string) => void;
  removeAll: () => void;
  getById: (id: string) => JournalEntry | undefined;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      create: (text, mood) => {
        const now = Date.now();
        const entry: JournalEntry = { id: generateId(), text, createdAt: now, updatedAt: now, mood };
        set((s) => ({ entries: [...s.entries, entry] }));
        return entry.id;
      },
      update: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e)),
        })),
      remove: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      removeAll: () => set({ entries: [] }),
      getById: (id) => get().entries.find((e) => e.id === id),
    }),
    { name: 'ebb.journal', storage: localStorage },
  ),
);
