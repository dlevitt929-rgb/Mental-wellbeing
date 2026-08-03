import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useCalmMotion } from '@/hooks/useCalmMotion';

function fire(promise: Promise<void>) {
  promise.catch(() => {});
}

/**
 * The one place every haptic in the app comes from — named for what's
 * happening, not for the underlying iOS/Android feedback type, so the
 * meaning can't drift screen to screen the way scattered `Haptics.*` calls
 * did before this existed.
 *
 * Every pattern here already respects the user's haptics toggle. A few also
 * back off further:
 *  - breathingPulse never fires in Night mode (no buzzing someone back
 *    toward sleep) and skips entirely under Reduce Motion, since it's a
 *    decorative sync cue, not essential feedback.
 *  - gentleArrival also skips under Reduce Motion for the same reason.
 *  - selection, softConfirmation, and warning stay available regardless —
 *    they're communicating something happened, not just adding texture.
 *
 * Device/platform gaps (no haptics engine, web) degrade silently: every
 * `expo-haptics` call is fire-and-forget with its rejection swallowed, the
 * same way the pre-existing scattered call sites already worked.
 */
export function useHaptics() {
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const { mode } = useTheme();
  const { reduced } = useCalmMotion();
  const isNight = mode === 'night';

  /** Choosing a tile, a mood, an environment, toggling a setting. */
  const selection = useCallback(() => {
    if (!hapticsEnabled) return;
    fire(Haptics.selectionAsync());
  }, [hapticsEnabled]);

  /** Saving a journal entry, completing a grounding step, adding a calm
   *  memory, setting a favourite — small, positive, and done. */
  const softConfirmation = useCallback(() => {
    if (!hapticsEnabled) return;
    fire(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  }, [hapticsEnabled]);

  /** Synced to a breathing timeline's inhale/exhale beats. */
  const breathingPulse = useCallback(() => {
    if (!hapticsEnabled || isNight || reduced) return;
    fire(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  }, [hapticsEnabled, isNight, reduced]);

  /** Entering a full-screen calming experience, revealing a future-self
   *  message, opening Calm Me content — a soft landing, not an alert. */
  const gentleArrival = useCallback(() => {
    if (!hapticsEnabled || reduced) return;
    fire(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft));
  }, [hapticsEnabled, reduced]);

  /** Sparingly: destructive actions, a failed secure unlock, an important
   *  non-emergency error. Never used for routine navigation. */
  const warning = useCallback(() => {
    if (!hapticsEnabled) return;
    fire(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
  }, [hapticsEnabled]);

  return { selection, softConfirmation, breathingPulse, gentleArrival, warning };
}
