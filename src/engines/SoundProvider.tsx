import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { SOUND_SOURCES, SoundId } from './soundEngine';
import { useSettingsStore } from '@/store/useSettingsStore';

interface SoundContextValue {
  current: SoundId | null;
  play: (id: SoundId, targetVolume?: number) => void;
  stop: (fadeMs?: number) => void;
  setVolume: (v: number) => void;
  duckTo: (v: number, ms?: number) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const player = useAudioPlayer(null, { updateInterval: 500 });
  const [current, setCurrent] = useState<SoundId | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' }).catch(() => {});
  }, []);

  useEffect(() => {
    player.loop = true;
  }, [player]);

  const clearFade = useCallback(() => {
    if (fadeTimer.current) {
      clearInterval(fadeTimer.current);
      fadeTimer.current = null;
    }
  }, []);

  const fadeTo = useCallback(
    (target: number, ms = 900) => {
      clearFade();
      const steps = Math.max(1, Math.round(ms / 60));
      const start = player.volume ?? 0;
      let step = 0;
      fadeTimer.current = setInterval(() => {
        step += 1;
        const t = Math.min(1, step / steps);
        player.volume = start + (target - start) * t;
        if (t >= 1) clearFade();
      }, 60);
    },
    [player, clearFade],
  );

  const play = useCallback(
    (id: SoundId, targetVolume = 0.55) => {
      if (!soundEnabled) return;
      player.replace(SOUND_SOURCES[id]);
      player.volume = 0;
      player.play();
      setCurrent(id);
      fadeTo(targetVolume, 1400);
    },
    [player, soundEnabled, fadeTo],
  );

  const stop = useCallback(
    (fadeMs = 900) => {
      fadeTo(0, fadeMs);
      setTimeout(() => {
        player.pause();
        setCurrent(null);
      }, fadeMs + 40);
    },
    [player, fadeTo],
  );

  const setVolume = useCallback(
    (v: number) => {
      player.volume = v;
    },
    [player],
  );

  const duckTo = useCallback((v: number, ms = 400) => fadeTo(v, ms), [fadeTo]);

  return (
    <SoundContext.Provider value={{ current, play, stop, setVolume, duckTo }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within SoundProvider');
  return ctx;
}
