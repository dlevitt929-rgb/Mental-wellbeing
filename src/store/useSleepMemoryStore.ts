import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localStorage } from './storage';

export type WokeReason = 'racing' | 'anxious' | 'nightmare' | 'uncomfortable' | 'dontknow' | 'notasleep';

interface SleepMemoryState {
  lastReason: WokeReason | null;
  /** How many times each reason has actually been chosen — a shortcut for
   *  "repeat last night's setup" only appears once something has genuinely
   *  recurred, never from a single use. */
  reasonCounts: Partial<Record<WokeReason, number>>;
  recordReason: (r: WokeReason) => void;
}

export const useSleepMemoryStore = create<SleepMemoryState>()(
  persist(
    (set) => ({
      lastReason: null,
      reasonCounts: {},
      recordReason: (r) =>
        set((s) => ({
          lastReason: r,
          reasonCounts: { ...s.reasonCounts, [r]: (s.reasonCounts[r] ?? 0) + 1 },
        })),
    }),
    { name: 'ebb.sleep-memory', storage: localStorage },
  ),
);

/** Returns the reason to repeat, only if it's actually happened more than once. */
export function getRepeatableSleepReason(state: SleepMemoryState): WokeReason | null {
  if (!state.lastReason) return null;
  return (state.reasonCounts[state.lastReason] ?? 0) >= 2 ? state.lastReason : null;
}
