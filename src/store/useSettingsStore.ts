import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localStorage } from './storage';
import { EnvironmentId } from '@/components/environments/types';

interface SettingsState {
  hasOnboarded: boolean;
  name: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  nightReminderEnabled: boolean;
  analyticsOptIn: boolean; // always false unless the user explicitly opts in; nothing is sent anywhere in this build regardless
  calmEnvironment: EnvironmentId;
  sleepEnvironment: EnvironmentId;
  setHasOnboarded: (v: boolean) => void;
  setName: (name: string) => void;
  setSoundEnabled: (v: boolean) => void;
  setHapticsEnabled: (v: boolean) => void;
  setNightReminderEnabled: (v: boolean) => void;
  setAnalyticsOptIn: (v: boolean) => void;
  setCalmEnvironment: (v: EnvironmentId) => void;
  setSleepEnvironment: (v: EnvironmentId) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      name: '',
      soundEnabled: true,
      hapticsEnabled: true,
      nightReminderEnabled: true,
      analyticsOptIn: false,
      calmEnvironment: 'abstract',
      sleepEnvironment: 'night',
      setHasOnboarded: (v) => set({ hasOnboarded: v }),
      setName: (name) => set({ name }),
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setHapticsEnabled: (v) => set({ hapticsEnabled: v }),
      setNightReminderEnabled: (v) => set({ nightReminderEnabled: v }),
      setAnalyticsOptIn: (v) => set({ analyticsOptIn: v }),
      setCalmEnvironment: (v) => set({ calmEnvironment: v }),
      setSleepEnvironment: (v) => set({ sleepEnvironment: v }),
    }),
    { name: 'ebb.settings', storage: localStorage },
  ),
);
