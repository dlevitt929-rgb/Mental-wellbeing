import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localStorage } from './storage';
import { Feeling } from '@/types';
import { CalmingPathSignals } from '@/engines/breathing';

const RESUME_WINDOW_MS = 30 * 60 * 1000;

export interface PanicSnapshot {
  feeling: Feeling;
  signals: CalmingPathSignals;
  planIndex: number;
  savedAt: number;
}

interface PanicResumeState {
  snapshot: PanicSnapshot | null;
  save: (snapshot: Omit<PanicSnapshot, 'savedAt'>) => void;
  clear: () => void;
}

/**
 * A tiny, persisted breadcrumb of where someone was in the Panic calming
 * plan — not the whole session, just enough (which questions they'd
 * answered, which step they were on) to rebuild the plan deterministically
 * and drop them back where they were if the app gets killed mid-session.
 * Never held onto for long: anything older than the resume window is
 * treated as gone, since offering to "continue" a panic episode from
 * yesterday would be strange, not comforting.
 */
export const usePanicResumeStore = create<PanicResumeState>()(
  persist(
    (set) => ({
      snapshot: null,
      save: (snapshot) => set({ snapshot: { ...snapshot, savedAt: Date.now() } }),
      clear: () => set({ snapshot: null }),
    }),
    { name: 'ebb.panic-resume', storage: localStorage },
  ),
);

export function getFreshPanicSnapshot(): PanicSnapshot | null {
  const { snapshot } = usePanicResumeStore.getState();
  if (!snapshot) return null;
  if (Date.now() - snapshot.savedAt > RESUME_WINDOW_MS) {
    usePanicResumeStore.getState().clear();
    return null;
  }
  return snapshot;
}
