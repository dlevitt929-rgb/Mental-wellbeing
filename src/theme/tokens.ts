export type ThemeMode = 'calm' | 'panic' | 'night' | 'reflect';

export interface ModePalette {
  bg: string;
  bgGradient: [string, string];
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentSoft: string;
  accentGradient: [string, string];
  danger: string;
}

/**
 * Each mode is a near-total re-skin, not a tint. Panic strips almost all
 * color; night goes near-black with zero blue punch; reflect is the only
 * mode allowed to feel "rich".
 */
export const palettes: Record<ThemeMode, ModePalette> = {
  calm: {
    bg: '#0B0F14',
    bgGradient: ['#0E141B', '#0B0F14'],
    surface: '#141B23',
    surfaceRaised: '#1B2530',
    border: '#26313D',
    text: '#F3F1EC',
    textMuted: '#A8B3BD',
    textFaint: '#6B7784',
    accent: '#E7A65C',
    accentSoft: '#8E7CC3',
    accentGradient: ['#E7A65C', '#8E7CC3'],
    danger: '#E2685A',
  },
  panic: {
    bg: '#0A0D12',
    bgGradient: ['#0C1015', '#0A0D12'],
    surface: '#12161C',
    surfaceRaised: '#181D25',
    border: '#232B34',
    text: '#F5F3EF',
    textMuted: '#9CA6B0',
    textFaint: '#5C6670',
    accent: '#E7B37C',
    accentSoft: '#7C93C3',
    accentGradient: ['#E7B37C', '#7C93C3'],
    danger: '#E2685A',
  },
  night: {
    bg: '#050608',
    bgGradient: ['#06070A', '#050608'],
    surface: '#0A0C10',
    surfaceRaised: '#0F1216',
    border: '#181B20',
    text: '#C9CCD1',
    textMuted: '#767B84',
    textFaint: '#454951',
    accent: '#8A6F9E',
    accentSoft: '#5C6C8A',
    accentGradient: ['#8A6F9E', '#5C6C8A'],
    danger: '#B9584E',
  },
  reflect: {
    bg: '#12141B',
    bgGradient: ['#181A24', '#12141B'],
    surface: '#1C1F2A',
    surfaceRaised: '#252938',
    border: '#323749',
    text: '#F5F2EC',
    textMuted: '#B2AFC9',
    textFaint: '#726F8A',
    accent: '#D98E63',
    accentSoft: '#9C8AD9',
    accentGradient: ['#D98E63', '#9C8AD9'],
    danger: '#E2685A',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radii = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  round: 999,
};

/** Motion is part of the emotional design: panic and night move slower than calm/reflect. */
export const motion: Record<ThemeMode, { fast: number; base: number; slow: number; breathe: number }> = {
  calm: { fast: 180, base: 320, slow: 520, breathe: 4000 },
  panic: { fast: 260, base: 480, slow: 900, breathe: 4600 },
  night: { fast: 320, base: 560, slow: 1100, breathe: 5200 },
  reflect: { fast: 200, base: 360, slow: 600, breathe: 4000 },
};

export const typeScale = {
  display: 34,
  title: 26,
  headline: 21,
  body: 17,
  callout: 15,
  caption: 13,
};
