import { useReducedMotion } from 'react-native-reanimated';

/**
 * Central place to ask "should this animate?" Wraps the OS Reduce Motion
 * preference. Ambient/decorative animation should check this and either
 * skip entirely or render a static equivalent — functional animation
 * (breathing pacing itself) should still run, just without embellishment.
 */
export function useCalmMotion() {
  const reduced = useReducedMotion();
  return { reduced, ambient: !reduced };
}
