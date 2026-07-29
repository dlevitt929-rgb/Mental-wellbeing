import { JournalEntry } from '@/types';

const MIN_ENTRIES = 5;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Purely observable, frequency-based notices about the person's own journal —
 * never a diagnosis, never about content, just "you've done X often lately."
 * Disableable in Settings; only looks at timestamps and the mood they chose.
 */
export function derivePatternHints(entries: JournalEntry[]): string[] {
  if (entries.length < MIN_ENTRIES) return [];

  const hints: string[] = [];
  const recent = [...entries].sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);

  const dayCounts = new Map<number, number>();
  for (const e of recent) {
    const day = new Date(e.createdAt).getDay();
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }
  const topDay = [...dayCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topDay && topDay[1] / recent.length >= 0.4 && topDay[1] >= 3) {
    hints.push(`You tend to write most on ${DAY_NAMES[topDay[0]]}s.`);
  }

  const nightCount = recent.filter((e) => {
    const h = new Date(e.createdAt).getHours();
    return h >= 22 || h < 4;
  }).length;
  if (nightCount / recent.length >= 0.4 && nightCount >= 3) {
    hints.push('A lot of what you write happens late at night.');
  }

  const moodCounts = new Map<string, number>();
  let moodedCount = 0;
  for (const e of recent) {
    if (!e.mood) continue;
    moodedCount += 1;
    moodCounts.set(e.mood, (moodCounts.get(e.mood) ?? 0) + 1);
  }
  const topMood = [...moodCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topMood && moodedCount >= 4 && topMood[1] / moodedCount >= 0.5) {
    hints.push(`"${topMood[0][0].toUpperCase()}${topMood[0].slice(1)}" has come up often in what you've marked lately.`);
  }

  return hints.slice(0, 2);
}
