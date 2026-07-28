import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localStorage } from './storage';

interface JournalSecurityState {
  lockEnabled: boolean;
  biometricEnabled: boolean;
  /** SHA-256 hex digest — the PIN itself is never stored. */
  pinHash: string | null;
  setLockEnabled: (v: boolean) => void;
  setBiometricEnabled: (v: boolean) => void;
  setPinHash: (hash: string | null) => void;
}

export const useJournalSecurityStore = create<JournalSecurityState>()(
  persist(
    (set) => ({
      lockEnabled: false,
      biometricEnabled: false,
      pinHash: null,
      setLockEnabled: (v) => set({ lockEnabled: v }),
      setBiometricEnabled: (v) => set({ biometricEnabled: v }),
      setPinHash: (hash) => set({ pinHash: hash }),
    }),
    { name: 'ebb.journal-security', storage: localStorage },
  ),
);

/** Not persisted on purpose — every fresh app launch re-locks the journal if a lock is set. */
export const useJournalUnlockedStore = create<{ unlocked: boolean; unlock: () => void; lock: () => void }>(
  (set) => ({
    unlocked: false,
    unlock: () => set({ unlocked: true }),
    lock: () => set({ unlocked: false }),
  }),
);
