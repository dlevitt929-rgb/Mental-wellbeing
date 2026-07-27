import { Technique } from '@/types';

export interface ToolkitItem {
  id: Technique;
  title: string;
  blurb: string;
  minutes: string;
  route: string;
  glyph: string;
  color: string;
}

export const TOOLKIT_ITEMS: ToolkitItem[] = [
  { id: 'breathing', title: 'Breathing', blurb: 'A slower rhythm for your body to follow.', minutes: '2–4 min', route: '/toolkit/breathing', glyph: '⊙', color: '#E7A65C' },
  { id: 'grounding', title: 'Grounding', blurb: 'Bring your attention back to the room around you.', minutes: '2–3 min', route: '/toolkit/grounding', glyph: '⬡', color: '#6FA37C' },
  { id: 'pmr', title: 'Progressive muscle relaxation', blurb: 'Tense and release, one part of your body at a time.', minutes: '4–6 min', route: '/toolkit/pmr', glyph: '◌', color: '#8E7CC3' },
  { id: 'body-scan', title: 'Body scan', blurb: 'A slow, gentle pass through how your body feels.', minutes: '4–6 min', route: '/toolkit/body-scan', glyph: '◍', color: '#7C93C3' },
  { id: 'guided-imagery', title: 'Guided imagery', blurb: 'A calm place to rest your attention for a while.', minutes: '3–5 min', route: '/toolkit/guided-imagery', glyph: '〜', color: '#5C8A93' },
  { id: 'cognitive-defusion', title: 'Letting thoughts be thoughts', blurb: 'Some distance between you and what your mind is saying.', minutes: '2–3 min', route: '/toolkit/defusion', glyph: '≈', color: '#7C93C3' },
  { id: 'sensory-grounding', title: 'Sensory grounding', blurb: 'Cold water, texture, taste — anything that pulls you into your body.', minutes: '1–2 min', route: '/toolkit/sensory', glyph: '❋', color: '#5C8A93' },
  { id: 'movement', title: 'Movement', blurb: 'Sometimes stillness isn’t what your body needs.', minutes: '2–4 min', route: '/toolkit/movement', glyph: '↝', color: '#D98E63' },
  { id: 'self-compassion', title: 'Self-compassion', blurb: 'What you’d say to someone you love, said to you.', minutes: '2 min', route: '/toolkit/self-compassion', glyph: '◉', color: '#C0658A' },
  { id: 'worry-postponement', title: 'Worry postponement', blurb: 'Not forever — just not right now.', minutes: '2 min', route: '/toolkit/worry-postponement', glyph: '◒', color: '#9C8AD9' },
  { id: 'emotional-regulation', title: 'Riding the wave', blurb: 'Feelings peak and then they fall — even the big ones.', minutes: '3 min', route: '/toolkit/emotional-regulation', glyph: '≋', color: '#5C6C8A' },
  { id: 'journaling', title: 'Get it out of your head', blurb: 'Put words to it without needing to solve it.', minutes: 'Open-ended', route: '/racing-thoughts', glyph: '✎', color: '#E7A65C' },
];
