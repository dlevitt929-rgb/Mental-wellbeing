import { useJournalSecurityStore, useJournalUnlockedStore } from '@/store/useJournalSecurityStore';

/** Returns true when the journal is safe to show right now. */
export function useJournalGate(): boolean {
  const lockEnabled = useJournalSecurityStore((s) => s.lockEnabled);
  const pinHashLoaded = useJournalSecurityStore((s) => s.pinHashLoaded);
  const hasPin = useJournalSecurityStore((s) => !!s.pinHash);
  const unlocked = useJournalUnlockedStore((s) => s.unlocked);
  if (!lockEnabled) return true;
  // The PIN hash now loads asynchronously from SecureStore — while that read
  // is in flight, fail closed rather than briefly treating "not loaded yet"
  // the same as "no PIN was ever set" (which would flash the journal open).
  if (!pinHashLoaded) return false;
  if (!hasPin) return true;
  return unlocked;
}
