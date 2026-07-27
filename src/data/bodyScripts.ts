export const BODY_SCAN_STEPS: string[] = [
  'Notice your feet, resting wherever they are.',
  'Notice your legs. Let them get heavy.',
  'Notice your stomach rising and falling.',
  'Notice your chest, breathing on its own.',
  'Notice your hands. Let your fingers uncurl.',
  'Notice your shoulders. Let them drop away from your ears.',
  'Notice your jaw. Let it loosen.',
  'Notice your forehead. Let it soften.',
  'Notice your whole body, resting.',
];

export interface PmrStep {
  muscle: string;
  tense: string;
  release: string;
}

export const PMR_STEPS: PmrStep[] = [
  { muscle: 'Hands', tense: 'Clench both fists, tightly.', release: 'Let go. Feel your hands go loose.' },
  { muscle: 'Arms', tense: 'Tense your arms, pulling them in.', release: 'Release. Let your arms fall heavy.' },
  { muscle: 'Shoulders', tense: 'Raise your shoulders to your ears.', release: 'Drop them. Let them fall.' },
  { muscle: 'Face', tense: 'Scrunch your whole face tight.', release: 'Let it go soft and loose.' },
  { muscle: 'Stomach', tense: 'Tighten your stomach.', release: 'Let it soften completely.' },
  { muscle: 'Legs', tense: 'Tense your legs, press your heels down.', release: 'Let them go heavy and loose.' },
  { muscle: 'Whole body', tense: 'Tense everything, all at once.', release: 'And release. All of it.' },
];
