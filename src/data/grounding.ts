export interface GroundingPrompt {
  sense: 'see' | 'feel' | 'hear' | 'smell' | 'taste';
  text: string;
}

/** The classic 5-4-3-2-1, redesigned as one tap-to-confirm prompt at a time. */
export const FIVE_SENSES_SEQUENCE: GroundingPrompt[] = [
  { sense: 'see', text: 'Find something blue.' },
  { sense: 'see', text: 'Find the furthest object you can see.' },
  { sense: 'see', text: 'Find something with a straight edge.' },
  { sense: 'see', text: 'Find something that’s moving, even slightly.' },
  { sense: 'see', text: 'Find something you’ve never really noticed before.' },
  { sense: 'feel', text: 'Feel the surface underneath your hand.' },
  { sense: 'feel', text: 'Feel where your feet meet the floor.' },
  { sense: 'feel', text: 'Feel the temperature of the air on your skin.' },
  { sense: 'feel', text: 'Feel the weight of your body in the chair or bed.' },
  { sense: 'hear', text: 'Notice the furthest sound you can hear.' },
  { sense: 'hear', text: 'Notice the closest sound you can hear.' },
  { sense: 'hear', text: 'Notice a sound coming from outside.' },
  { sense: 'smell', text: 'Notice anything you can smell right now.' },
  { sense: 'smell', text: 'If nothing stands out, notice the absence of smell.' },
  { sense: 'taste', text: 'Notice any taste in your mouth right now.' },
];

export const CAMERA_CHALLENGES: string[] = [
  'Find something green.',
  'Find something soft.',
  'Find something older than you.',
  'Find something that makes you smile.',
  'Find something shaped like a circle.',
  'Find something that reflects light.',
  'Find something with more than one color.',
  'Find something you could hold in one hand.',
  'Find the brightest thing in the room.',
  'Find something that feels familiar.',
  'Find something with a pattern.',
  'Find something you haven’t touched today.',
  'Find something taller than you.',
  'Find something that makes a sound if you move it.',
  'Find something that belongs to someone you love.',
];

export const PHYSICAL_GROUNDING_STEPS: string[] = [
  'Put both feet flat on the floor.',
  'Notice where your body is touching the chair or bed.',
  'Press your feet down, just a little.',
  'Let your shoulders drop, even half an inch.',
  'Unclench your jaw.',
  'Let your hands rest open, palms down.',
];
