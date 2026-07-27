import { BreathingTechnique, BreathingTechniqueId } from '@/types';

export const BREATHING_TECHNIQUES: Record<BreathingTechniqueId, BreathingTechnique> = {
  'physiological-sigh': {
    id: 'physiological-sigh',
    name: 'Double inhale, long exhale',
    description:
      'Two short inhales through the nose, then one long, slow exhale. One of the fastest ways to bring a racing body back down.',
    phases: [
      { key: 'inhale', seconds: 2, label: 'Breathe in' },
      { key: 'inhale2', seconds: 1.2, label: 'Sip in a little more' },
      { key: 'exhale', seconds: 6, label: 'Let it all go' },
    ],
    cycles: 4,
  },
  'extended-exhale': {
    id: 'extended-exhale',
    name: 'Extended exhale',
    description: 'A longer exhale than inhale tells your body it can start to relax.',
    phases: [
      { key: 'inhale', seconds: 4, label: 'Breathe in' },
      { key: 'exhale', seconds: 7, label: 'Breathe out, slowly' },
    ],
    cycles: 6,
  },
  box: {
    id: 'box',
    name: 'Box breathing',
    description: 'Equal parts in, hold, out, hold. Steady and even, good for a racing mind.',
    phases: [
      { key: 'inhale', seconds: 4, label: 'Breathe in' },
      { key: 'hold', seconds: 4, label: 'Hold' },
      { key: 'exhale', seconds: 4, label: 'Breathe out' },
      { key: 'holdEmpty', seconds: 4, label: 'Hold' },
    ],
    cycles: 5,
  },
  diaphragmatic: {
    id: 'diaphragmatic',
    name: 'Slow belly breathing',
    description: 'Deep, slow breaths low into your belly rather than your chest.',
    phases: [
      { key: 'inhale', seconds: 5, label: 'Breathe in, low into your belly' },
      { key: 'exhale', seconds: 6, label: 'Breathe out' },
    ],
    cycles: 6,
  },
  paced: {
    id: 'paced',
    name: 'Gentle paced breathing',
    description: 'A simple, even rhythm — nothing to get right, just something to follow.',
    phases: [
      { key: 'inhale', seconds: 4, label: 'Breathe in' },
      { key: 'exhale', seconds: 5, label: 'Breathe out' },
    ],
    cycles: 8,
  },
};

export interface CalmingPathSignals {
  heartRacing?: boolean;
  dizzy?: boolean;
  thoughtsRacing?: boolean;
  catastrophic?: boolean;
  unsafe?: boolean;
}

/**
 * The app picks — the person never has to choose a technique while panicking.
 */
export function chooseBreathingTechnique(signals: CalmingPathSignals): BreathingTechniqueId {
  if (signals.heartRacing || signals.dizzy) return 'physiological-sigh';
  if (signals.thoughtsRacing) return 'box';
  if (signals.catastrophic) return 'extended-exhale';
  return 'extended-exhale';
}

export function totalTechniqueSeconds(t: BreathingTechnique): number {
  return t.phases.reduce((s, p) => s + p.seconds, 0) * t.cycles;
}
