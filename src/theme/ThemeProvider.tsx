import React, { createContext, useContext, useMemo, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Appearance, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { palettes, motion, ThemeMode, ModePalette, ColorScheme } from './tokens';
import { useSettingsStore } from '@/store/useSettingsStore';

/**
 * The OS scheme, kept live. RN's `useColorScheme()` hook doesn't reliably
 * re-render on web when `prefers-color-scheme` changes without a reload, so
 * this subscribes directly to `Appearance.addChangeListener` and, on web,
 * also to the underlying `matchMedia` query as a belt-and-braces fallback —
 * "system appearance changes in real time" has to actually mean real time.
 */
function useLiveSystemScheme(): ColorScheme {
  const [value, setValue] = useState<ColorScheme>(() => (Appearance.getColorScheme() === 'light' ? 'light' : 'dark'));

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setValue(colorScheme === 'light' ? 'light' : 'dark');
    });

    let mql: MediaQueryList | undefined;
    let mqlHandler: ((e: MediaQueryListEvent) => void) | undefined;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia) {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
      mqlHandler = (e) => setValue(e.matches ? 'dark' : 'light');
      mql.addEventListener?.('change', mqlHandler);
    }

    return () => {
      sub.remove();
      if (mql && mqlHandler) mql.removeEventListener?.('change', mqlHandler);
    };
  }, []);

  return value;
}

interface ThemeContextValue {
  mode: ThemeMode;
  scheme: ColorScheme;
  palette: ModePalette;
  motion: (typeof motion)[ThemeMode];
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('calm');
  const appearance = useSettingsStore((s) => s.appearance);
  const systemScheme = useLiveSystemScheme();
  const scheme: ColorScheme = appearance === 'system' ? systemScheme : appearance;
  const palette = palettes[mode][scheme];

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      scheme,
      palette,
      motion: motion[mode],
      setMode,
    }),
    [mode, scheme, palette],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <ThemeTransitionVeil scheme={scheme} color={palette.bg} />
    </ThemeContext.Provider>
  );
}

/** A brief color wash that covers the instant palette swap underneath it —
 *  switching Light/Dark should read as a soft cross-dissolve, never a flash.
 *  Only reacts to the resolved light/dark scheme, not the emotional `mode`,
 *  which already has its own screen-level transitions. */
function ThemeTransitionVeil({ scheme, color }: { scheme: ColorScheme; color: string }) {
  const opacity = useSharedValue(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    opacity.value = withSequence(
      withTiming(0.92, { duration: 160, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 520, easing: Easing.inOut(Easing.sin) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheme]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color }]} />
    </Animated.View>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/** Call at the top of a screen to set the app's mood for as long as it is mounted. */
export function useModeOnFocus(mode: ThemeMode) {
  const { setMode } = useTheme();
  React.useEffect(() => {
    setMode(mode);
    return () => setMode('calm');
  }, [mode, setMode]);
}
