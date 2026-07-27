import { useEffect } from 'react';
import { useSound } from '@/engines/SoundProvider';
import { useSettingsStore } from '@/store/useSettingsStore';
import { soundForEnvironment } from '@/engines/soundEngine';
import { EnvironmentId } from '@/components/environments/types';

/** Plays the ambient bed matching an environment while `active` is true, and
 * fades it out the moment the session ends or the screen unmounts. */
export function useSessionAmbience(active: boolean, environmentId: EnvironmentId, volume = 0.26) {
  const sound = useSound();
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  useEffect(() => {
    if (active && soundEnabled) {
      sound.play(soundForEnvironment(environmentId), volume);
    } else {
      sound.stop(1000);
    }
    return () => {
      if (active) sound.stop(900);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, environmentId, soundEnabled]);
}
