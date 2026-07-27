import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localStorage } from './storage';
import { WorryEntry } from '@/types';
import { generateId } from '@/utils/id';

interface WorryState {
  worries: WorryEntry[];
  add: (text: string, remindTomorrow: boolean) => void;
  resolve: (id: string) => void;
  clearResolved: () => void;
  /** Worries put in the box before today that haven't been resolved yet. */
  pendingFromBefore: () => WorryEntry[];
}

export function isBeforeToday(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() !== now.getFullYear() ||
    d.getMonth() !== now.getMonth() ||
    d.getDate() !== now.getDate()
  );
}

export function selectPendingFromBefore(worries: WorryEntry[]): WorryEntry[] {
  return worries.filter((w) => w.remindTomorrow && !w.resolvedAt && isBeforeToday(w.createdAt));
}

export const useWorryStore = create<WorryState>()(
  persist(
    (set, get) => ({
      worries: [],
      add: (text, remindTomorrow) =>
        set((s) => ({
          worries: [
            ...s.worries,
            { id: generateId(), text, createdAt: Date.now(), remindTomorrow },
          ],
        })),
      resolve: (id) =>
        set((s) => ({
          worries: s.worries.map((w) => (w.id === id ? { ...w, resolvedAt: Date.now() } : w)),
        })),
      clearResolved: () => set((s) => ({ worries: s.worries.filter((w) => !w.resolvedAt) })),
      pendingFromBefore: () =>
        get().worries.filter((w) => w.remindTomorrow && !w.resolvedAt && isBeforeToday(w.createdAt)),
    }),
    { name: 'ebb.worries', storage: localStorage },
  ),
);
