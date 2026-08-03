import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { MessageBeat } from '@/components/MessageBeat';
import { EnvironmentPicker } from '@/components/EnvironmentPicker';
import { WhisperLarge, Whisper, Body, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useSettingsStore, Appearance, PresencePreference } from '@/store/useSettingsStore';
import { EnvironmentId } from '@/components/environments/types';
import { Feeling } from '@/types';

const STEPS = [
  'opening',
  'what-it-does',
  'reassurance',
  'privacy',
  'situations',
  'environment',
  'presence',
  'appearance-sound',
  'closing',
] as const;

const SITUATION_OPTIONS: { id: Feeling; label: string }[] = [
  { id: 'panicking', label: 'Panicking' },
  { id: 'cant-sleep', label: "Can't sleep" },
  { id: 'racing-thoughts', label: 'Overthinking' },
  { id: 'overwhelmed', label: 'Feeling overwhelmed' },
  { id: 'alone', label: 'Feeling alone' },
];

const PRESENCE_OPTIONS: { id: PresencePreference; label: string; hint: string }[] = [
  { id: 'guided', label: 'Guide me', hint: 'Something to follow, step by step' },
  { id: 'quiet', label: 'Quiet presence', hint: 'Mostly just company, little talking' },
  { id: 'both', label: 'Depends on the day', hint: "We'll figure it out together" },
];

const APPEARANCE_OPTIONS: { id: Appearance; label: string }[] = [
  { id: 'system', label: 'Follow System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export default function Onboarding() {
  const { palette } = useTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const setHasOnboarded = useSettingsStore((s) => s.setHasOnboarded);
  const commonSituations = useSettingsStore((s) => s.commonSituations);
  const setCommonSituations = useSettingsStore((s) => s.setCommonSituations);
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  const setCalmEnvironment = useSettingsStore((s) => s.setCalmEnvironment);
  const presencePreference = useSettingsStore((s) => s.presencePreference);
  const setPresencePreference = useSettingsStore((s) => s.setPresencePreference);
  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);

  const step = STEPS[stepIndex];
  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));

  const finish = () => {
    setHasOnboarded(true);
    router.replace('/home');
  };

  const skipEverything = () => {
    setHasOnboarded(true);
    router.replace('/home');
  };

  const needHelpNow = () => {
    // Using the core feature IS the onboarding — never make someone who's
    // struggling sit through setup screens to reach it.
    setHasOnboarded(true);
    router.replace('/panic');
  };

  const toggleSituation = (id: Feeling) => {
    setCommonSituations(
      commonSituations.includes(id) ? commonSituations.filter((s) => s !== id) : [...commonSituations, id],
    );
  };

  return (
    <Screen center showBack={false}>
      <View style={styles.wrap}>
        {step === 'opening' && (
          <Animated.View entering={FadeIn.duration(600)} style={styles.block}>
            <WhisperLarge center>For the moments when everything feels like too much.</WhisperLarge>
            <CalmButton label="Continue" variant="primary" size="large" style={{ marginTop: spacing.xl }} onPress={next} />
          </Animated.View>
        )}

        {step === 'what-it-does' && (
          <View style={styles.block}>
            <MessageBeat
              beats={[
                { text: 'Panicking.', holdMs: 1600 },
                { text: "Can't sleep.", holdMs: 1600 },
                { text: 'Overthinking.', holdMs: 1600 },
                { text: 'Overwhelmed.', holdMs: 1600 },
                { text: 'Needing someone to just stay.', holdMs: 2000 },
                { text: 'Ebb meets you wherever you are.', holdMs: 2400 },
              ]}
              onDone={next}
            />
          </View>
        )}

        {step === 'reassurance' && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.block}>
            <Whisper center>No streaks. No scores. No pressure to feel better immediately.</Whisper>
            <Body color={palette.textMuted} center style={{ marginTop: spacing.lg }}>
              Ebb can quietly learn what tends to help you — only with your say, and you can turn
              this off anytime in Settings.
            </Body>
            <CalmButton label="Continue" variant="primary" size="large" style={{ marginTop: spacing.xl }} onPress={next} />
          </Animated.View>
        )}

        {step === 'privacy' && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.block}>
            <Whisper center>What you write here stays on your device.</Whisper>
            <Body color={palette.textMuted} center style={{ marginTop: spacing.lg }}>
              Thoughts, letters, worries, contacts — stored only on this phone. Nothing is
              uploaded, sold, or shared. You can clear any of it at any time in Settings.
            </Body>
            <Caption color={palette.textFaint} center style={{ marginTop: spacing.lg }}>
              Ebb offers support in the moment. It doesn't replace professional care or emergency
              services.
            </Caption>
            <CalmButton label="Continue" variant="primary" size="large" style={{ marginTop: spacing.xl }} onPress={next} />
          </Animated.View>
        )}

        {step === 'situations' && (
          <Animated.View entering={FadeInDown.duration(450)} style={styles.block}>
            <Whisper center>What tends to bring you here?</Whisper>
            <Body color={palette.textMuted} center style={{ marginTop: spacing.sm }}>
              Pick as many as fit. This just helps Ebb put the right thing first.
            </Body>
            <View style={styles.chipRow}>
              {SITUATION_OPTIONS.map((opt) => {
                const active = commonSituations.includes(opt.id);
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => toggleSituation(opt.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    style={[
                      styles.chip,
                      { borderColor: active ? palette.accent : palette.border, backgroundColor: active ? palette.surfaceRaised : 'transparent' },
                    ]}
                  >
                    <Body color={active ? palette.text : palette.textMuted}>{opt.label}</Body>
                  </Pressable>
                );
              })}
            </View>
            <CalmButton label="Continue" variant="primary" size="large" style={{ marginTop: spacing.xl, width: '100%' }} onPress={next} />
            <CalmButton label="Skip for now" variant="ghost" onPress={next} />
          </Animated.View>
        )}

        {step === 'environment' && (
          <Animated.View entering={FadeInDown.duration(450)} style={styles.block}>
            <Whisper center>Which of these feels calming?</Whisper>
            <Body color={palette.textMuted} center style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
              We'll use this as the backdrop during breathing and calming sessions.
            </Body>
            <EnvironmentPicker value={calmEnvironment} onChange={(id: EnvironmentId) => setCalmEnvironment(id)} />
            <CalmButton label="Continue" variant="primary" size="large" style={{ marginTop: spacing.xl, width: '100%' }} onPress={next} />
            <CalmButton label="Skip for now" variant="ghost" onPress={next} />
          </Animated.View>
        )}

        {step === 'presence' && (
          <Animated.View entering={FadeInDown.duration(450)} style={styles.block}>
            <Whisper center>When things are hard, do you want guidance or quiet company?</Whisper>
            <View style={{ marginTop: spacing.lg, gap: 10, width: '100%' }}>
              {PRESENCE_OPTIONS.map((opt) => {
                const active = presencePreference === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setPresencePreference(opt.id)}
                    style={[
                      styles.option,
                      { borderColor: active ? palette.accent : palette.border, backgroundColor: active ? palette.surfaceRaised : palette.surface },
                    ]}
                  >
                    <Body>{opt.label}</Body>
                    <Caption color={palette.textMuted} style={{ marginTop: 2 }}>
                      {opt.hint}
                    </Caption>
                  </Pressable>
                );
              })}
            </View>
            <CalmButton label="Continue" variant="primary" size="large" style={{ marginTop: spacing.xl, width: '100%' }} onPress={next} />
            <CalmButton label="Skip for now" variant="ghost" onPress={next} />
          </Animated.View>
        )}

        {step === 'appearance-sound' && (
          <Animated.View entering={FadeInDown.duration(450)} style={styles.block}>
            <Whisper center>A couple of last things.</Whisper>
            <Caption color={palette.textFaint} style={{ marginTop: spacing.lg, marginBottom: 6, alignSelf: 'flex-start' }}>
              APPEARANCE
            </Caption>
            <View style={styles.chipRow}>
              {APPEARANCE_OPTIONS.map((opt) => {
                const active = appearance === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setAppearance(opt.id)}
                    style={[
                      styles.chip,
                      { borderColor: active ? palette.accent : palette.border, backgroundColor: active ? palette.surfaceRaised : 'transparent' },
                    ]}
                  >
                    <Body color={active ? palette.text : palette.textMuted}>{opt.label}</Body>
                  </Pressable>
                );
              })}
            </View>
            <Caption color={palette.textFaint} style={{ marginTop: spacing.lg, marginBottom: 6, alignSelf: 'flex-start' }}>
              SOUND DURING SESSIONS
            </Caption>
            <View style={styles.chipRow}>
              <Pressable
                onPress={() => setSoundEnabled(true)}
                style={[styles.chip, { borderColor: soundEnabled ? palette.accent : palette.border, backgroundColor: soundEnabled ? palette.surfaceRaised : 'transparent' }]}
              >
                <Body color={soundEnabled ? palette.text : palette.textMuted}>On by default</Body>
              </Pressable>
              <Pressable
                onPress={() => setSoundEnabled(false)}
                style={[styles.chip, { borderColor: !soundEnabled ? palette.accent : palette.border, backgroundColor: !soundEnabled ? palette.surfaceRaised : 'transparent' }]}
              >
                <Body color={!soundEnabled ? palette.text : palette.textMuted}>Off by default</Body>
              </Pressable>
            </View>
            <CalmButton label="Continue" variant="primary" size="large" style={{ marginTop: spacing.xl, width: '100%' }} onPress={next} />
          </Animated.View>
        )}

        {step === 'closing' && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.block}>
            <WhisperLarge center>You're set.</WhisperLarge>
            <Body color={palette.textMuted} center style={{ marginTop: spacing.md }}>
              Come here anytime — for a minute, or a lot longer.
            </Body>
            <CalmButton label="Let's go" variant="primary" size="large" style={{ marginTop: spacing.xl }} onPress={finish} />
          </Animated.View>
        )}
      </View>

      {step !== 'opening' && step !== 'closing' && (
        <Pressable onPress={skipEverything} style={styles.skipAll} accessibilityLabel="Skip the rest of setup">
          <Caption color={palette.textFaint}>Skip for now</Caption>
        </Pressable>
      )}

      <Pressable onPress={needHelpNow} style={styles.needHelp} accessibilityLabel="I need help right now — skip setup and start immediately">
        <Caption color={palette.accent}>I need help right now</Caption>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center' },
  block: { alignItems: 'center', width: '100%', paddingHorizontal: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.lg, justifyContent: 'center' },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radii.round, borderWidth: 1 },
  option: { width: '100%', padding: spacing.md, borderRadius: radii.md, borderWidth: 1 },
  skipAll: { position: 'absolute', top: 20, right: spacing.lg, opacity: 0.7 },
  needHelp: { position: 'absolute', bottom: 20, alignSelf: 'center' },
});
