import { BreathingPhase } from '@/types';

export type EnvironmentId =
  | 'abstract'
  | 'ocean'
  | 'night'
  | 'rain'
  | 'fire'
  | 'forest'
  | 'clouds'
  | 'sunset';

export interface EnvironmentProps {
  /** 0 = fully settled/exhaled, 1 = fully expanded/inhaled. Static 0.4 when not breath-linked. */
  breathPhase?: BreathingPhase['key'] | null;
  /** Duration of the current phase in seconds — lets the environment ease at the same pace as the breath. */
  phaseSeconds?: number;
  /** 0 = the session's starting mood, 1 = fully warmed/landed. Drives a cool→warm palette blend. */
  warmth?: number;
}

export const ENVIRONMENT_LABELS: Record<EnvironmentId, string> = {
  abstract: 'Flowing calm',
  ocean: 'Ocean',
  night: 'Night sky',
  rain: 'Rainy window',
  fire: 'Fireplace',
  forest: 'Forest',
  clouds: 'Drifting clouds',
  sunset: 'Sunset',
};

export const ENVIRONMENT_EMOJI: Record<EnvironmentId, string> = {
  abstract: '◈',
  ocean: '〜',
  night: '✦',
  rain: '☂',
  fire: '◐',
  forest: '❋',
  clouds: '☁',
  sunset: '◒',
};
