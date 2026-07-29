import { Technique, Session } from '@/types';
import { TOOLKIT_ITEMS } from '@/data/toolkit';
import { getTopTechnique } from '@/engines/insights';

export type TimeContext = 'late-night' | 'morning' | 'afternoon' | 'evening';

/** Reads the moment, not just the clock — late night gets treated differently
 *  everywhere in the app, because 2am and 2pm are not the same person. */
export function timeContext(date: Date = new Date()): TimeContext {
  const h = date.getHours();
  if (h < 5) return 'late-night';
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

const TECHNIQUE_ROUTE: Partial<Record<Technique, string>> = {
  ...Object.fromEntries(TOOLKIT_ITEMS.map((item) => [item.id, item.route])),
  talking: '/stay-with-me?tab=talk',
  'stay-with-me': '/stay-with-me',
  'sleep-exercise': '/sleep',
};

export interface RightNowSuggestion {
  label: string;
  route: string;
}

/** The one contextual line under the hero button — never a second button,
 *  never a new tile. Picks the single most useful next step for right now. */
export function pickRightNowSuggestion(sessions: Session[], now: Date = new Date()): RightNowSuggestion {
  const ctx = timeContext(now);

  if (ctx === 'late-night') {
    return { label: "It's late. Try Nothing To Do — no timer, nothing to finish →", route: '/nothing-to-do' };
  }

  const top = getTopTechnique(sessions);
  if (top && TECHNIQUE_ROUTE[top]) {
    return { label: "Let's start with what helped you last time →", route: TECHNIQUE_ROUTE[top] as string };
  }

  return { label: "Don't want to decide anything? Try One Minute With Me →", route: '/one-minute' };
}
