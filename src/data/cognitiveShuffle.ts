/**
 * A gentle "cognitive shuffle": unrelated, neutral, low-stakes words that
 * are hard to weave into a worry spiral. Used at night to quietly derail
 * racing thoughts without effort.
 */
export const SHUFFLE_WORDS: string[] = [
  'lantern', 'meadow', 'cushion', 'harbor', 'ribbon', 'thistle', 'orchard', 'compass',
  'blanket', 'pebble', 'willow', 'kettle', 'canyon', 'satchel', 'ember', 'driftwood',
  'paper lantern', 'garden hose', 'wool sweater', 'porch light', 'gravel path', 'tin cup',
  'moss', 'lighthouse', 'hammock', 'violin', 'clover', 'birdhouse', 'quilt', 'canoe',
  'chalkboard', 'apricot', 'windowsill', 'acorn', 'lantern light', 'wooden spoon',
  'meadowlark', 'sailboat', 'cinnamon', 'sundial', 'raincoat', 'wicker basket',
];

export function shuffledWords(count = 30): string[] {
  const pool = [...SHUFFLE_WORDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
