import { useJournalSecurityStore, useJournalUnlockedStore } from '@/store/useJournalSecurityStore';

/** Returns true when the journal is safe to show right now. */
export function useJournalGate(): boolean {
  const lockEnabled = useJournalSecurityStore((s) => s.lockEnabled);
  const hasPin = useJournalSecurityStore((s) => !!s.pinHash);
  const unlocked = useJournalUnlockedStore((s) => s.unlocked);
  if (!lockEnabled || !hasPin) return true;
  return unlocked;
}
