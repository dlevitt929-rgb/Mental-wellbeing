import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localStorage } from './storage';
import { CalmPlanEntry } from '@/types';
import { generateId } from '@/utils/id';

interface CalmPlanState {
  entries: CalmPlanEntry[];
  add: (category: CalmPlanEntry['category'], text: string) => void;
  remove: (id: string) => void;
  byCategory: (category: CalmPlanEntry['category']) => CalmPlanEntry[];
}

export const useCalmPlanStore = create<CalmPlanState>()(
  persist(
    (set, get) => ({
      entries: [],
      add: (category, text) =>
        set((s) => ({
          entries: [...s.entries, { id: generateId(), category, text, createdAt: Date.now() }],
        })),
      remove: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      byCategory: (category) => get().entries.filter((e) => e.category === category),
    }),
    { name: 'ebb.calmplan', storage: localStorage },
  ),
);
