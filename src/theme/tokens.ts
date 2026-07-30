export type ThemeMode = 'calm' | 'panic' | 'night' | 'reflect';
export type ColorScheme = 'light' | 'dark';

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
 * Each mode is a near-total re-skin, not a tint, and now each mode carries a
 * genuinely separate light design rather than an inverted dark one. Dark
 * keeps the original warm charcoal/navy identity untouched; light reaches
 * for the same emotional register — warm, soft, unhurried — using cream and
 * linen tones instead of clinical white, with every accent deepened enough
 * to stay legible on a pale ground.
 */
export const palettes: Record<ThemeMode, Record<ColorScheme, ModePalette>> = {
  calm: {
    dark: {
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
    light: {
      bg: '#F7F1E6',
      bgGradient: ['#FAF6EE', '#F3EBDA'],
      surface: '#FFFDF8',
      surfaceRaised: '#FFFFFF',
      border: '#E7DCC8',
      text: '#2E2A22',
      textMuted: '#6C6152',
      textFaint: '#A0947F',
      accent: '#C97A3D',
      accentSoft: '#7A63B0',
      accentGradient: ['#E0985A', '#9583C9'],
      danger: '#C8503F',
    },
  },
  panic: {
    dark: {
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
    light: {
      bg: '#F5F1EA',
      bgGradient: ['#F8F4EE', '#F0EAE0'],
      surface: '#FCFAF5',
      surfaceRaised: '#FFFFFF',
      border: '#E5DCCD',
      text: '#2B2723',
      textMuted: '#6D655A',
      textFaint: '#9E968A',
      accent: '#BD8148',
      accentSoft: '#5C7BAE',
      accentGradient: ['#DDA067', '#87A0CE'],
      danger: '#C8503F',
    },
  },
  night: {
    dark: {
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
    light: {
      bg: '#EEECF1',
      bgGradient: ['#F2F0F5', '#E7E4EC'],
      surface: '#F8F7FA',
      surfaceRaised: '#FFFFFF',
      border: '#D9D5E0',
      text: '#2A2830',
      textMuted: '#696671',
      textFaint: '#9C98A5',
      accent: '#6E5580',
      accentSoft: '#48586F',
      accentGradient: ['#8A6F9E', '#5C6C8A'],
      danger: '#A8483C',
    },
  },
  reflect: {
    dark: {
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
    light: {
      bg: '#F8F0E4',
      bgGradient: ['#FBF4E9', '#F1E5D2'],
      surface: '#FFFCF5',
      surfaceRaised: '#FFFFFF',
      border: '#E9DBC3',
      text: '#2E2620',
      textMuted: '#6E6154',
      textFaint: '#9C9182',
      accent: '#B96F42',
      accentSoft: '#7E68BE',
      accentGradient: ['#D98E63', '#9C8AD9'],
      danger: '#C8503F',
    },
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
