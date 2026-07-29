import { soundForEnvironment } from '@/engines/soundEngine';
import { EnvironmentId } from '@/components/environments/types';
import { useAudioExperience } from './useAudioExperience';

/** Plays the ambient bed matching an environment while `active` is true, and
 * fades it out the moment the session ends or the screen unmounts. Thin
 * convenience wrapper over useAudioExperience for the common "one
 * environment, one owner" case. */
export function useSessionAmbience(active: boolean, environmentId: EnvironmentId, volume = 0.26) {
  useAudioExperience(active, active ? soundForEnvironment(environmentId) : null, {
    volume,
    label: `env:${environmentId}`,
  });
}
