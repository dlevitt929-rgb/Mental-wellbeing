/**
 * The single source of truth for how Ebb talks about leaving, cancelling,
 * or declining something — so wording never drifts screen to screen, and a
 * panicking person always recognizes what a button will do.
 *
 * Pick the bucket that matches what's actually happening, not just the
 * nearest-sounding word:
 *  - doneForNow: leaving a calming session (breathing, grounding, a player) —
 *    whether or not it was finished. Never phrased as failure.
 *  - needSomethingDifferent: switching to a different technique while
 *    staying in the same flow (e.g. mid Panic plan).
 *  - notRightNow: declining an optional follow-up suggestion — journaling
 *    after a session, saving a reflection, reaching out, turning on
 *    personalization. Never used for leaving a session itself.
 *  - skipForNow: onboarding and setup questions only.
 *  - stopSession: stopping audio/an exercise that's actively running.
 *    Context-specific wording ("End breathing") is fine as long as it's
 *    clearly a stop, not phrased as giving up.
 *  - cancel: discarding an in-progress creation/edit with unsaved changes.
 *  - back: returning to the previous screen with state preserved.
 */
export const EXIT_COPY = {
  doneForNow: 'Done for now',
  needSomethingDifferent: 'I need something different',
  notRightNow: 'Not right now',
  skipForNow: 'Skip for now',
  stopSession: 'Stop session',
  cancel: 'Cancel',
  back: 'Back',
} as const;
