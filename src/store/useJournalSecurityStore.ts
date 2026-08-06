import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { localStorage } from './storage';

/** SHA-256 hex digest of the journal PIN — the PIN itself is never stored,
 *  and (unlike everything else here) the hash lives in the platform
 *  Keychain/Keystore via SecureStore, not plain AsyncStorage: it's the one
 *  thing in this store that gates access to the most private data in the
 *  app. expo-secure-store has no web implementation, so web falls back to
 *  AsyncStorage directly — the same on-device-only guarantee as before,
 *  just without OS-level encryption (there is no browser equivalent). */
const PIN_HASH_KEY = 'ebb.journal-pin-hash';

async function readPinHash(): Promise<string | null> {
  if (Platform.OS === 'web') return AsyncStorage.getItem(PIN_HASH_KEY);
  return SecureStore.getItemAsync(PIN_HASH_KEY);
}

async function writePinHash(hash: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    if (hash) await AsyncStorage.setItem(PIN_HASH_KEY, hash);
    else await AsyncStorage.removeItem(PIN_HASH_KEY);
    return;
  }
  if (hash) await SecureStore.setItemAsync(PIN_HASH_KEY, hash);
  else await SecureStore.deleteItemAsync(PIN_HASH_KEY).catch(() => {});
}

interface JournalSecurityState {
  lockEnabled: boolean;
  biometricEnabled: boolean;
  pinHash: string | null;
  /** False until the initial SecureStore read completes — the journal gate
   *  must treat "not loaded yet" as locked, never as "no PIN, so unlocked". */
  pinHashLoaded: boolean;
  setLockEnabled: (v: boolean) => void;
  setBiometricEnabled: (v: boolean) => void;
  setPinHash: (hash: string | null) => Promise<void>;
  loadPinHash: () => Promise<void>;
}

export const useJournalSecurityStore = create<JournalSecurityState>()(
  persist(
    (set) => ({
      lockEnabled: false,
      biometricEnabled: false,
      pinHash: null,
      pinHashLoaded: false,
      setLockEnabled: (v) => set({ lockEnabled: v }),
      setBiometricEnabled: (v) => set({ biometricEnabled: v }),
      setPinHash: async (hash) => {
        await writePinHash(hash);
        set({ pinHash: hash, pinHashLoaded: true });
      },
      loadPinHash: async () => {
        const hash = await readPinHash().catch(() => null);
        set({ pinHash: hash, pinHashLoaded: true });
      },
    }),
    {
      name: 'ebb.journal-security',
      storage: localStorage,
      // pinHash is intentionally excluded — it lives in SecureStore (see
      // above), not in this plain-AsyncStorage-backed persisted blob.
      partialize: (s) => ({ lockEnabled: s.lockEnabled, biometricEnabled: s.biometricEnabled }),
    },
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
