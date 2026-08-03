import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localStorage } from './storage';
import { EnvironmentId } from '@/components/environments/types';
import { Feeling } from '@/types';

export type Appearance = 'light' | 'dark' | 'system';
export type PresencePreference = 'guided' | 'quiet' | 'both';
export type VisualEffects = 'auto' | 'full' | 'reduced';

interface SettingsState {
  hasOnboarded: boolean;
  name: string;
  appearance: Appearance;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  nightReminderEnabled: boolean;
  analyticsOptIn: boolean; // always false unless the user explicitly opts in; nothing is sent anywhere in this build regardless
  calmEnvironment: EnvironmentId;
  sleepEnvironment: EnvironmentId;
  /** Explicitly chosen via long-press ("Set as favourite") — distinct from
   *  the breathing/sleep defaults, and only ever set by a deliberate action. */
  favoriteEnvironment: EnvironmentId | null;
  journalPatternHintsEnabled: boolean;
  /** From onboarding — which situations bring someone here most, used to
   *  gently reorder Home rather than as anything shown back to them as data. */
  commonSituations: Feeling[];
  /** From onboarding — biases the default Stay With Me presence mode. */
  presencePreference: PresencePreference;
  visualEffects: VisualEffects;
  setHasOnboarded: (v: boolean) => void;
  setName: (name: string) => void;
  setAppearance: (v: Appearance) => void;
  setSoundEnabled: (v: boolean) => void;
  setHapticsEnabled: (v: boolean) => void;
  setNightReminderEnabled: (v: boolean) => void;
  setAnalyticsOptIn: (v: boolean) => void;
  setCalmEnvironment: (v: EnvironmentId) => void;
  setSleepEnvironment: (v: EnvironmentId) => void;
  setFavoriteEnvironment: (v: EnvironmentId | null) => void;
  setJournalPatternHintsEnabled: (v: boolean) => void;
  setCommonSituations: (v: Feeling[]) => void;
  setPresencePreference: (v: PresencePreference) => void;
  setVisualEffects: (v: VisualEffects) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      name: '',
      appearance: 'dark',
      soundEnabled: true,
      hapticsEnabled: true,
      nightReminderEnabled: true,
      analyticsOptIn: false,
      calmEnvironment: 'abstract',
      sleepEnvironment: 'night',
      favoriteEnvironment: null,
      journalPatternHintsEnabled: true,
      commonSituations: [],
      presencePreference: 'both',
      visualEffects: 'auto',
      setHasOnboarded: (v) => set({ hasOnboarded: v }),
      setName: (name) => set({ name }),
      setAppearance: (v) => set({ appearance: v }),
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setHapticsEnabled: (v) => set({ hapticsEnabled: v }),
      setNightReminderEnabled: (v) => set({ nightReminderEnabled: v }),
      setAnalyticsOptIn: (v) => set({ analyticsOptIn: v }),
      setCalmEnvironment: (v) => set({ calmEnvironment: v }),
      setSleepEnvironment: (v) => set({ sleepEnvironment: v }),
      setFavoriteEnvironment: (v) => set({ favoriteEnvironment: v }),
      setJournalPatternHintsEnabled: (v) => set({ journalPatternHintsEnabled: v }),
      setCommonSituations: (v) => set({ commonSituations: v }),
      setPresencePreference: (v) => set({ presencePreference: v }),
      setVisualEffects: (v) => set({ visualEffects: v }),
    }),
    { name: 'ebb.settings', storage: localStorage },
  ),
);
