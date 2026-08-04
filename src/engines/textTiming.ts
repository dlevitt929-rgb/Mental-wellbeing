/**
 * One formula for "how long should this stay on screen," used everywhere
 * MessageBeat shows a line of guidance. Before this existed, every screen
 * picked its own `holdMs` by feel, which is how reassurance like "You don't
 * need to solve everything tonight" ended up visible for the same three
 * seconds as "Unclench your jaw." — the message that most needs time to
 * land emotionally got the least.
 *
 * This is deliberately a floor, not a fixed value: a screen's own `holdMs`
 * (when it sets one) is respected as long as it's not shorter than what the
 * content genuinely needs to be read and felt. Nothing here shortens a
 * screen's own choice — it only lengthens ones that were too tight.
 */

export type GuidancePace = 'slower' | 'standard' | 'faster';

export interface ReadingTimeOptions {
  pace?: GuidancePace;
  /** A reassuring line that should be allowed to settle, not just be read. */
  emotionalWeight?: 'low' | 'medium' | 'high';
  /** The person needs to actually do something physical before moving on. */
  requiresAction?: boolean;
  /** From the OS's text-size setting (RN's `fontScale`) — larger text takes longer to read. */
  fontScale?: number;
  /** A screen reader is likely still announcing this line. */
  screenReaderEnabled?: boolean;
}

/** Exported so screens with their own hold-duration timers (not routed
 *  through MessageBeat) can still respect the same pace setting. */
export const PACE_MULTIPLIER: Record<GuidancePace, number> = {
  slower: 1.4,
  standard: 1,
  faster: 0.75,
};

// Deliberately slower than average silent-reading speed (~230wpm) — this is
// guidance meant to be absorbed while calming down, not skimmed.
const WORDS_PER_MINUTE = 145;
const MS_PER_WORD = 60000 / WORDS_PER_MINUTE;

const MIN_MS = 2200; // a one-word instruction still needs a moment
const ACTION_BONUS_MS = 1400; // extra time to actually do the thing, not just read about it
const EMOTIONAL_SETTLE_MS: Record<'low' | 'medium' | 'high', number> = {
  low: 0,
  medium: 900,
  high: 2000,
};
const SCREEN_READER_MIN_MS = 4200;

function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function calculateReadingTime(text: string, opts: ReadingTimeOptions = {}): number {
  const words = wordCount(text);
  if (words === 0) return 0; // a deliberate silent beat — timing comes from holdMs, not this

  const pace = opts.pace ?? 'standard';
  let ms = Math.max(MIN_MS, words * MS_PER_WORD);

  if (opts.requiresAction) ms += ACTION_BONUS_MS;
  ms += EMOTIONAL_SETTLE_MS[opts.emotionalWeight ?? 'low'];

  ms *= PACE_MULTIPLIER[pace];

  // Large text takes longer to read, but not linearly — someone at 2x text
  // size isn't reading twice as slowly, their eyes just travel further.
  const fontScale = opts.fontScale ?? 1;
  if (fontScale > 1) ms *= 1 + (fontScale - 1) * 0.6;

  if (opts.screenReaderEnabled) {
    // VoiceOver/TalkBack narrate at a fairly fixed pace of their own —
    // don't let the visual timer race ahead of an announcement in progress.
    ms = Math.max(ms, SCREEN_READER_MIN_MS, words * MS_PER_WORD * 1.3);
  }

  return Math.round(ms);
}
