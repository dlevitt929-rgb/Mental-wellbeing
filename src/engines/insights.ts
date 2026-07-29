import { Session, Technique } from '@/types';

const TECHNIQUE_LABEL: Partial<Record<Technique, string>> = {
  breathing: 'Breathing',
  grounding: 'Grounding',
  'body-scan': 'Body scanning',
  pmr: 'Progressive muscle relaxation',
  talking: 'Talking things through',
  'stay-with-me': 'Having something stay with you',
  'cognitive-defusion': 'Letting thoughts be "just thoughts"',
  'sensory-grounding': 'Sensory grounding',
  movement: 'Moving your body',
  'hold-to-breathe': 'Breathing at your own pace',
  'follow-along': 'Letting something else lead for a while',
  stillness: 'Sitting in stillness',
  'look-away-grounding': 'Looking away from the screen and into the room',
};

const MIN_SAMPLES = 3;
const HELPFUL_RATIO = 0.6;

interface RankedTechnique {
  t: Technique;
  ratio: number;
}

function rankTechniques(finished: Session[]): RankedTechnique[] {
  const usage: Partial<Record<Technique, number>> = {};
  const helpful: Partial<Record<Technique, number>> = {};

  for (const s of finished) {
    const wasHelpful = s.helped === 'much-better' || s.helped === 'a-little-better';
    for (const t of s.techniquesUsed) {
      usage[t] = (usage[t] ?? 0) + 1;
      if (wasHelpful) helpful[t] = (helpful[t] ?? 0) + 1;
    }
  }

  return (Object.keys(usage) as Technique[])
    .filter((t) => (usage[t] ?? 0) >= MIN_SAMPLES && TECHNIQUE_LABEL[t])
    .map((t) => ({ t, ratio: (helpful[t] ?? 0) / (usage[t] ?? 1) }))
    .sort((a, b) => b.ratio - a.ratio);
}

/** The technique with the best track record, if there's enough history to be confident about it — for the "let's start with what helped you last time" nudge. */
export function getTopTechnique(sessions: Session[]): Technique | null {
  const finished = sessions.filter((s) => s.endedAt);
  const ranked = rankTechniques(finished);
  if (ranked[0] && ranked[0].ratio >= HELPFUL_RATIO) return ranked[0].t;
  return null;
}

/**
 * Careful on purpose: these are gentle, first-person observations from the
 * person's own history — never a diagnosis, never a score.
 */
export function deriveInsights(sessions: Session[]): string[] {
  const finished = sessions.filter((s) => s.endedAt);
  if (finished.length < MIN_SAMPLES) return [];

  const ranked = rankTechniques(finished);
  const insights: string[] = [];

  if (ranked[0] && ranked[0].ratio >= HELPFUL_RATIO) {
    insights.push(`${TECHNIQUE_LABEL[ranked[0].t]} tends to help you.`);
  }

  const reachedOut = finished.filter((s) => s.techniquesUsed.includes('talking')).length;
  if (reachedOut >= MIN_SAMPLES) {
    insights.push(`You've reached out instead of handling everything alone ${reachedOut} times.`);
  }

  const nightSessions = finished.filter((s) => s.feeling === 'cant-sleep' && s.endedAt);
  if (nightSessions.length >= MIN_SAMPLES) {
    const avgMs =
      nightSessions.reduce((sum, s) => sum + ((s.endedAt as number) - s.startedAt), 0) / nightSessions.length;
    const minutes = Math.max(1, Math.round(avgMs / 60000));
    insights.push(`Night anxiety has usually lasted around ${minutes} minute${minutes === 1 ? '' : 's'} for you.`);
  }

  insights.push(`You've made it through moments like this ${finished.length} times before.`);

  return insights.slice(0, 3);
}
