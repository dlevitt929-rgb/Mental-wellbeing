import { useEffect, useRef } from 'react';

/**
 * Dev-only performance instrumentation — every function here is a no-op in
 * production builds. None of this proves real-device smoothness; it's a
 * starting point for someone with a physical device and a profiler attached,
 * not a replacement for one.
 */

const startedAt = Date.now();
const milestones: Record<string, number> = {};

/** Marks how long after module load a named milestone was reached (fonts
 *  ready, settings hydrated, first screen mounted, etc). */
export function markStartup(label: string) {
  if (!__DEV__) return;
  if (milestones[label] !== undefined) return;
  const elapsed = Date.now() - startedAt;
  milestones[label] = elapsed;
  // eslint-disable-next-line no-console
  console.log(`[startup] ${label} at +${elapsed}ms`);
}

/** Coarse jank detector: watches the gap between animation frames and warns
 *  when one runs long enough to read as a dropped frame (~<30fps). Sampled
 *  with a cooldown so a rough patch doesn't flood the console. */
export function useFrameDropWarnings(screenName: string) {
  const lastFrame = useRef<number | null>(null);
  const lastWarnAt = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!__DEV__) return undefined;
    const tick = (time: number) => {
      if (lastFrame.current !== null) {
        const gap = time - lastFrame.current;
        if (gap > 32 && time - lastWarnAt.current > 2000) {
          lastWarnAt.current = time;
          // eslint-disable-next-line no-console
          console.log(`[frames] ${screenName}: ${Math.round(gap)}ms since last frame (~${Math.round(1000 / gap)}fps)`);
        }
      }
      lastFrame.current = time;
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [screenName]);
}

/** Audio lifecycle logging — request/release/error events, dev only. */
export function logAudioEvent(event: string, detail: Record<string, unknown> = {}) {
  if (!__DEV__) return;
  // eslint-disable-next-line no-console
  console.log(`[audio] ${event}`, detail);
}
