import { Mood } from '@/types';

export interface MoodDef {
  id: Mood;
  label: string;
  color: string;
}

export const MOODS: MoodDef[] = [
  { id: 'calm', label: 'Calm', color: '#7C93C3' },
  { id: 'happy', label: 'Happy', color: '#E7A65C' },
  { id: 'okay', label: 'Okay', color: '#8FA9AC' },
  { id: 'anxious', label: 'Anxious', color: '#C0658A' },
  { id: 'overwhelmed', label: 'Overwhelmed', color: '#E2685A' },
  { id: 'sad', label: 'Sad', color: '#5C6C8A' },
  { id: 'angry', label: 'Angry', color: '#B9584E' },
  { id: 'numb', label: 'Numb', color: '#726F8A' },
  { id: 'hopeful', label: 'Hopeful', color: '#6FA37C' },
  { id: 'tired', label: 'Tired', color: '#8E7CC3' },
];

export const MOOD_BY_ID: Record<Mood, MoodDef> = MOODS.reduce(
  (acc, m) => ({ ...acc, [m.id]: m }),
  {} as Record<Mood, MoodDef>,
);
