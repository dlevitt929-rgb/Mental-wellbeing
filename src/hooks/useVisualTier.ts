import { useSettingsStore } from '@/store/useSettingsStore';
import { useCalmMotion } from '@/hooks/useCalmMotion';

export type VisualTier = 'full' | 'reduced' | 'minimal';

/**
 * Resolves how much visual complexity the app should render right now.
 *
 *  - Minimal: OS Reduce Motion is on. This always wins, regardless of the
 *    in-app setting — it's a firm accessibility signal, not a preference.
 *  - Full / Reduced: the person's explicit "Visual effects" choice.
 *  - Auto: there is no reliable way to detect device capability from JS
 *    alone, and guessing wrong would mean quietly telling someone their
 *    phone is "low-end." Auto stays at Full — the safe default is to trust
 *    the device rather than assume the worst.
 *
 * Screens use this to skip the heaviest layers only (large particle counts,
 * secondary blur, continuous ambient drift) — never core functional motion
 * like the breathing animation itself.
 */
export function useVisualTier(): VisualTier {
  const visualEffects = useSettingsStore((s) => s.visualEffects);
  const { reduced } = useCalmMotion();
  if (reduced) return 'minimal';
  if (visualEffects === 'auto') return 'full';
  return visualEffects;
}
