import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localStorage } from './storage';
import { Feeling, Session, Technique } from '@/types';
import { generateId } from '@/utils/id';

interface SessionState {
  sessions: Session[];
  current: Session | null;
  start: (feeling: Feeling) => string;
  logStep: (step: string) => void;
  logTechnique: (technique: Technique) => void;
  end: (patch?: Partial<Pick<Session, 'helped' | 'reliefRating'>>) => void;
  discardCurrent: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      current: null,
      start: (feeling) => {
        const session: Session = {
          id: generateId(),
          startedAt: Date.now(),
          feeling,
          path: [],
          techniquesUsed: [],
        };
        set({ current: session });
        return session.id;
      },
      logStep: (step) =>
        set((s) => (s.current ? { current: { ...s.current, path: [...s.current.path, step] } } : {})),
      logTechnique: (technique) =>
        set((s) =>
          s.current && !s.current.techniquesUsed.includes(technique)
            ? { current: { ...s.current, techniquesUsed: [...s.current.techniquesUsed, technique] } }
            : {},
        ),
      end: (patch) => {
        const current = get().current;
        if (!current) return;
        const finished: Session = { ...current, endedAt: Date.now(), ...patch };
        set((s) => ({ sessions: [...s.sessions, finished], current: null }));
      },
      discardCurrent: () => set({ current: null }),
    }),
    {
      name: 'ebb.sessions',
      storage: localStorage,
      partialize: (s) => ({ sessions: s.sessions }) as SessionState,
    },
  ),
);
