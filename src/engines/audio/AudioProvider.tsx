import { useEffect } from 'react';
import { AudioManager } from './AudioManager';
import { useSettingsStore } from '@/store/useSettingsStore';

/**
 * Mounted once at the app root. Boots the audio decks and keeps the manager's
 * mute state in lockstep with the user's sound preference — "mute means
 * mute," everywhere, immediately.
 */
export function AudioProvider() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  useEffect(() => {
    AudioManager.init();
  }, []);

  useEffect(() => {
    AudioManager.setMuted(!soundEnabled);
  }, [soundEnabled]);

  return null;
}
