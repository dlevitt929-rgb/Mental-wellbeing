import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useJournalUnlockedStore } from '@/store/useJournalSecurityStore';

/**
 * Re-locks the journal the instant the app leaves the foreground, not just on
 * a fresh launch. Without this, unlocking the journal and then backgrounding
 * the app (a call, a notification, handing the phone to someone) would leave
 * it sitting unlocked for whoever opens the app next.
 */
export function JournalSecurityGuard() {
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') useJournalUnlockedStore.getState().lock();
    });
    return () => sub.remove();
  }, []);

  return null;
}
