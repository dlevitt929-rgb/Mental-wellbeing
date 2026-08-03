import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/store/useSessionStore';
import { Feeling, Technique } from '@/types';

/**
 * Starts a session exactly once when a screen mounts, optionally logging an
 * initial technique. A handful of screens used to do this as a render-time
 * side effect guarded only by a ref check — safe in the common case, but a
 * render that gets thrown away without committing (React can do this) would
 * still leave the guard ref flipped, silently skipping the real start. This
 * runs inside an effect instead, which only ever fires for a render that
 * actually committed.
 */
export function useSessionOnMount(feeling: Feeling, technique?: Technique) {
  const start = useSessionStore((s) => s.start);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    start(feeling);
    if (technique) logTechnique(technique);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
