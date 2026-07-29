import { useEffect, useRef } from 'react';
import { AudioManager } from '@/engines/audio/AudioManager';
import { SoundId } from '@/engines/soundEngine';

let instanceCounter = 0;

/**
 * Declares "this experience owns ambient audio while `active` is true."
 * Each call site gets a stable, unique owner id, so unrelated screens can
 * never accidentally stop each other's sound — the fix for audio surviving
 * rapid navigation between experiences.
 */
export function useAudioExperience(
  active: boolean,
  soundId: SoundId | null,
  opts: { volume?: number; fadeMs?: number; label?: string } = {},
) {
  const ownerIdRef = useRef<string | undefined>(undefined);
  if (!ownerIdRef.current) {
    instanceCounter += 1;
    ownerIdRef.current = `${opts.label ?? 'experience'}:${instanceCounter}`;
  }
  const ownerId = ownerIdRef.current;
  const volume = opts.volume ?? 0.28;
  const fadeMs = opts.fadeMs;

  useEffect(() => {
    if (active && soundId) {
      AudioManager.request(ownerId, soundId, { volume, fadeMs });
    } else {
      AudioManager.release(ownerId, fadeMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, soundId, volume]);

  useEffect(() => {
    return () => {
      AudioManager.release(ownerId, 700);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
