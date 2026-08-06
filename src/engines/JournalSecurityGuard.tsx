import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useJournalSecurityStore, useJournalUnlockedStore } from '@/store/useJournalSecurityStore';

/**
 * Re-locks the journal the instant the app leaves the foreground, not just on
 * a fresh launch. Without this, unlocking the journal and then backgrounding
 * the app (a call, a notification, handing the phone to someone) would leave
 * it sitting unlocked for whoever opens the app next.
 *
 * Also kicks off the one SecureStore read the PIN hash needs, as early in the
 * app's life as possible — the journal gate fails closed until this resolves,
 * so starting it here (rather than lazily on first journal visit) keeps that
 * closed window as short as it can be.
 */
export function JournalSecurityGuard() {
  useEffect(() => {
    useJournalSecurityStore.getState().loadPinHash();
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') useJournalUnlockedStore.getState().lock();
    });
    return () => sub.remove();
  }, []);

  return null;
}
