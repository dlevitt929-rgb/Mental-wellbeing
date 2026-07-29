import { Mood } from '@/types';

export interface WeatherDef {
  glyph: string;
  label: string;
}

/** Emotional weather — a softer, less clinical way to say what a mood word
 *  says. Never a replacement for the mood picker, just another way to see it. */
export const WEATHER_BY_MOOD: Record<Mood, WeatherDef> = {
  happy: { glyph: '✦', label: 'Bright' },
  hopeful: { glyph: '◒', label: 'Clearing' },
  calm: { glyph: '☁', label: 'Calm skies' },
  okay: { glyph: '◐', label: 'Mild' },
  tired: { glyph: '〜', label: 'Overcast' },
  anxious: { glyph: '≈', label: 'Turbulent' },
  numb: { glyph: '⋯', label: 'Foggy' },
  sad: { glyph: '○', label: 'Rainy' },
  overwhelmed: { glyph: '◎', label: 'Stormy' },
  angry: { glyph: '⊙', label: 'Charged' },
};
