import { useEffect } from 'react';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';

/** Eases toward a changing JS number instead of snapping — used so breath-linked
 * intensity changes glide rather than pop when the phase changes. */
export function useSmoothedNumber(target: number, durationMs = 900) {
  const smoothed = useSharedValue(target);
  useEffect(() => {
    smoothed.value = withTiming(target, { duration: durationMs, easing: Easing.inOut(Easing.sin) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);
  return smoothed;
}
