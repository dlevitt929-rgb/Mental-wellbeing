import { useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

/** A gentle 0→1→0 ping-pong loop. Returns a static 0.5 when motion is reduced. */
export function useSlowLoop(durationMs: number, reduced: boolean, delayMs = 0) {
  const v = useSharedValue(reduced ? 0.5 : 0);
  useEffect(() => {
    if (reduced) {
      v.value = 0.5;
      return;
    }
    const t = setTimeout(() => {
      v.value = withRepeat(withTiming(1, { duration: durationMs, easing: Easing.inOut(Easing.sin) }), -1, true);
    }, delayMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, durationMs, delayMs]);
  return v;
}
