import { detectSafetyLevel, SafetyLevel } from './safety';

export interface CompanionReply {
  text: string;
  safety: SafetyLevel;
}

interface Category {
  match: RegExp;
  pool: string[];
}

// Every pool is short on purpose. During acute anxiety, long paragraphs are the
// opposite of helpful — the AI companion is not a therapist, it is a calm presence.
const CATEGORIES: Category[] = [
  {
    match: /heart|racing|pounding|chest/i,
    pool: [
      'I hear you. Your heart racing is your body, not a signal something is wrong.',
      'That’s a lot to feel. Put a hand on your chest — just notice it, don’t fight it.',
      'Okay. Let’s slow one breath down together.',
    ],
  },
  {
    match: /breath|can'?t breathe|suffocat/i,
    pool: [
      'Let’s breathe out slower than we breathe in. I’m right here.',
      'You are getting air. Try letting the exhale be longer than the inhale.',
    ],
  },
  {
    match: /dizzy|lighthead|faint/i,
    pool: ['Sit if you can. Feel the surface holding you up.', 'That will pass. Let your weight settle down.'],
  },
  {
    match: /can'?t stop|racing thoughts|thoughts won'?t|overthink/i,
    pool: [
      'You don’t need to catch every thought. Let them pass.',
      'Your mind is loud right now. That’s okay — it doesn’t need to be quiet for you to be okay.',
    ],
  },
  {
    match: /alone|lonely|nobody|no one/i,
    pool: ['I’m here with you right now.', 'You reached out. That already counts for something.'],
  },
  {
    match: /scared|afraid|terrified|panick/i,
    pool: ['I’m here. You don’t need to fix anything right now.', 'This is frightening, and it is also temporary.'],
  },
  {
    match: /sad|crying|cry|upset/i,
    pool: ['You’re allowed to feel this.', 'Let it out. There’s no rush.'],
  },
  {
    match: /angry|furious|mad|rage/i,
    pool: ['That’s a lot of heat to be carrying. You don’t have to act on it right now.', 'Okay. Let’s just breathe through this part.'],
  },
  {
    match: /numb|nothing|empty|flat/i,
    pool: ['Numb is still a real place to be. You don’t have to perform a feeling.', 'I’m here either way.'],
  },
  {
    match: /tired|exhausted|can'?t sleep|awake/i,
    pool: ['Your body needs rest, even if sleep isn’t here yet.', 'You don’t have to solve anything tonight.'],
  },
  {
    match: /safe|unsafe|danger/i,
    pool: ['If you’re not somewhere safe, let’s change that first.', 'Are you able to get somewhere steadier right now?'],
  },
];

const FALLBACK_POOL = [
  'I’m here.',
  'Stay with me for a few more minutes.',
  'One breath at a time — you don’t need the whole picture right now.',
  'Whatever it is, it doesn’t need solving this second.',
  'You’re allowed to feel whatever this is.',
];

const recentReplies: string[] = [];

function pick(pool: string[]): string {
  const options = pool.filter((p) => !recentReplies.includes(p));
  const chosen = (options.length ? options : pool)[Math.floor(Math.random() * (options.length ? options.length : pool.length))];
  recentReplies.push(chosen);
  if (recentReplies.length > 6) recentReplies.shift();
  return chosen;
}

export function companionRespond(userText: string): CompanionReply {
  const safety = detectSafetyLevel(userText);
  if (safety !== 'none') {
    return { text: '', safety };
  }
  const category = CATEGORIES.find((c) => c.match.test(userText));
  const text = pick(category ? category.pool : FALLBACK_POOL);
  return { text, safety: 'none' };
}

export const OPENING_LINE = "What's going on? You can type as little or as much as you want.";
