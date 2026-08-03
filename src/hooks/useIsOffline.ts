import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Nothing in this app requires a network connection — breathing, journaling,
 * calm memories, and every other tool already work fully offline. This only
 * exists so the app can say so, instead of leaving someone to wonder.
 *
 * Web has a real signal (`navigator.onLine` + the online/offline events).
 * Native has no connectivity API without adding a dependency like
 * `@react-native-community/netinfo`, which this build doesn't include —
 * so native always reports "online" rather than guessing wrong.
 */
export function useIsOffline(): boolean {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined') return;
    setOffline(!navigator.onLine);
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  return offline;
}
