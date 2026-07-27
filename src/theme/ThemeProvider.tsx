import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { palettes, motion, ThemeMode, ModePalette } from './tokens';

interface ThemeContextValue {
  mode: ThemeMode;
  palette: ModePalette;
  motion: (typeof motion)[ThemeMode];
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('calm');

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      palette: palettes[mode],
      motion: motion[mode],
      setMode,
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
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
