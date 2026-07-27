import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Title, Body, Callout, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useWorryStore, selectPendingFromBefore } from '@/store/useWorryStore';
import { deriveInsights } from '@/engines/insights';
import { Feeling } from '@/types';

const FEELINGS: { id: Feeling; label: string; route: string }[] = [
  { id: 'panicking', label: 'I think I’m panicking', route: '/panic?feeling=panicking' },
  { id: 'cant-sleep', label: 'I can’t sleep', route: '/sleep' },
  { id: 'racing-thoughts', label: 'My thoughts won’t stop', route: '/racing-thoughts' },
  { id: 'overwhelmed', label: 'I feel overwhelmed', route: '/panic?feeling=overwhelmed' },
  { id: 'alone', label: 'I feel alone', route: '/connection' },
  { id: 'need-calm', label: 'I need to calm down', route: '/panic?feeling=need-calm' },
  { id: 'something-happened', label: 'Something happened', route: '/panic?feeling=something-happened' },
  { id: 'dont-know', label: 'I don’t even know', route: '/unsure' },
];

export default function Home() {
  const { palette } = useTheme();
  const name = useSettingsStore((s) => s.name);
  const sessions = useSessionStore((s) => s.sessions);
  const insights = useMemo(() => deriveInsights(sessions), [sessions]);
  const worries = useWorryStore((s) => s.worries);
  const pendingWorries = useMemo(() => selectPendingFromBefore(worries), [worries]);
  const resolveWorry = useWorryStore((s) => s.resolve);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Body color={palette.textMuted}>{greeting()}{name ? `, ${name}` : ''}</Body>
        <Title style={{ marginTop: 6 }}>What's happening right now?</Title>
      </View>

      {pendingWorries.length > 0 && (
        <View style={[styles.insightsBox, { borderColor: palette.border, backgroundColor: palette.surface, marginBottom: spacing.md }]}>
          <Caption color={palette.textFaint} style={{ marginBottom: 6 }}>
            LAST NIGHT YOU SET THIS ASIDE
          </Caption>
          {pendingWorries.map((w) => (
            <View key={w.id} style={{ marginBottom: 8 }}>
              <Body color={palette.textMuted}>{w.text}</Body>
              <Pressable onPress={() => resolveWorry(w.id)}>
                <Caption color={palette.accent} style={{ marginTop: 4 }}>
                  I've thought about it
                </Caption>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View style={styles.grid}>
        {FEELINGS.map((f, i) => (
          <Animated.View key={f.id} entering={FadeInUp.delay(i * 45).duration(360)}>
            <FeelingRow label={f.label} onPress={() => router.push(f.route as any)} />
          </Animated.View>
        ))}
      </View>

      {insights.length > 0 && (
        <View style={[styles.insightsBox, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          {insights.map((line, i) => (
            <Caption key={i} color={palette.textMuted} style={{ marginBottom: i === insights.length - 1 ? 0 : 6 }}>
              {line}
            </Caption>
          ))}
        </View>
      )}

      <View style={styles.secondary}>
        <SecondaryLink label="Explore the toolkit" onPress={() => router.push('/toolkit')} />
        <SecondaryLink label="My Calm Plan" onPress={() => router.push('/calm-plan')} />
        <SecondaryLink label="A letter from calm you" onPress={() => router.push('/letters')} />
        <SecondaryLink label="Settings & privacy" onPress={() => router.push('/settings')} />
      </View>
    </Screen>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'It’s late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function FeelingRow({ label, onPress }: { label: string; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Callout>{label}</Callout>
    </Pressable>
  );
}

function SecondaryLink({ label, onPress }: { label: string; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, paddingVertical: 10 }]}>
      <Body color={palette.textMuted}>{label}</Body>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.lg },
  grid: { gap: 10 },
  row: {
    paddingVertical: 18,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  insightsBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  secondary: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
  },
});
