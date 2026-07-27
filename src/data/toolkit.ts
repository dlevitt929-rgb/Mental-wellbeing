import { Technique } from '@/types';

export interface ToolkitItem {
  id: Technique;
  title: string;
  blurb: string;
  minutes: string;
  route: string;
}

export const TOOLKIT_ITEMS: ToolkitItem[] = [
  { id: 'breathing', title: 'Breathing', blurb: 'A slower rhythm for your body to follow.', minutes: '2–4 min', route: '/toolkit/breathing' },
  { id: 'grounding', title: 'Grounding', blurb: 'Bring your attention back to the room around you.', minutes: '2–3 min', route: '/toolkit/grounding' },
  { id: 'pmr', title: 'Progressive muscle relaxation', blurb: 'Tense and release, one part of your body at a time.', minutes: '4–6 min', route: '/toolkit/pmr' },
  { id: 'body-scan', title: 'Body scan', blurb: 'A slow, gentle pass through how your body feels.', minutes: '4–6 min', route: '/toolkit/body-scan' },
  { id: 'guided-imagery', title: 'Guided imagery', blurb: 'A calm place to rest your attention for a while.', minutes: '3–5 min', route: '/toolkit/guided-imagery' },
  { id: 'cognitive-defusion', title: 'Letting thoughts be thoughts', blurb: 'Some distance between you and what your mind is saying.', minutes: '2–3 min', route: '/toolkit/defusion' },
  { id: 'sensory-grounding', title: 'Sensory grounding', blurb: 'Cold water, texture, taste — anything that pulls you into your body.', minutes: '1–2 min', route: '/toolkit/sensory' },
  { id: 'movement', title: 'Movement', blurb: 'Sometimes stillness isn’t what your body needs.', minutes: '2–4 min', route: '/toolkit/movement' },
  { id: 'self-compassion', title: 'Self-compassion', blurb: 'What you’d say to someone you love, said to you.', minutes: '2 min', route: '/toolkit/self-compassion' },
  { id: 'worry-postponement', title: 'Worry postponement', blurb: 'Not forever — just not right now.', minutes: '2 min', route: '/toolkit/worry-postponement' },
  { id: 'emotional-regulation', title: 'Riding the wave', blurb: 'Feelings peak and then they fall — even the big ones.', minutes: '3 min', route: '/toolkit/emotional-regulation' },
  { id: 'journaling', title: 'Get it out of your head', blurb: 'Put words to it without needing to solve it.', minutes: 'Open-ended', route: '/racing-thoughts' },
];
