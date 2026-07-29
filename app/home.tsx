import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { CalmTile } from '@/components/CalmTile';
import { HeroHelpButton } from '@/components/HeroHelpButton';
import { Title, Body, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useWorryStore, selectPendingFromBefore } from '@/store/useWorryStore';
import { deriveInsights } from '@/engines/insights';
import { pickRightNowSuggestion, timeContext } from '@/engines/rightNow';

interface TileDef {
  label: string;
  glyph: string;
  colors: [string, string];
  route: string;
}

const TILES: TileDef[] = [
  { label: 'I can’t sleep', glyph: '☾', colors: ['#8A6F9E', '#5C6C8A'], route: '/sleep' },
  { label: 'My mind won’t stop', glyph: '≈', colors: ['#7C93C3', '#8E7CC3'], route: '/racing-thoughts' },
  { label: 'I feel overwhelmed', glyph: '◎', colors: ['#E2685A', '#D98E63'], route: '/panic?feeling=overwhelmed' },
  { label: 'I feel alone', glyph: '◐', colors: ['#9C8AD9', '#5C6C8A'], route: '/connection' },
  { label: 'I need to calm down', glyph: '⊙', colors: ['#E7A65C', '#8E7CC3'], route: '/panic?feeling=need-calm' },
  { label: 'Something happened', glyph: '✦', colors: ['#D98E63', '#9C5B7C'], route: '/panic?feeling=something-happened' },
  { label: 'Stay with me', glyph: '◉', colors: ['#E7A65C', '#C0658A'], route: '/stay-with-me' },
  { label: 'I don’t even know', glyph: '⋯', colors: ['#7C93C3', '#726F8A'], route: '/unsure' },
];

export default function Home() {
  const { palette } = useTheme();
  const name = useSettingsStore((s) => s.name);
  const sessions = useSessionStore((s) => s.sessions);
  const insights = useMemo(() => deriveInsights(sessions), [sessions]);
  const worries = useWorryStore((s) => s.worries);
  const pendingWorries = useMemo(() => selectPendingFromBefore(worries), [worries]);
  const resolveWorry = useWorryStore((s) => s.resolve);
  const rightNow = useMemo(() => pickRightNowSuggestion(sessions), [sessions]);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Body color={palette.textMuted}>{greeting()}{name ? `, ${name}` : ''}</Body>
        <Title style={{ marginTop: 6 }}>What's happening right now?</Title>
      </View>

      <HeroHelpButton />

      <Pressable onPress={() => router.push(rightNow.route)} style={styles.oneMinute}>
        <Caption color={palette.textMuted}>{rightNow.label}</Caption>
      </Pressable>

      {pendingWorries.length > 0 && (
        <View style={[styles.insightsBox, { borderColor: palette.border, backgroundColor: palette.surface, marginTop: spacing.lg }]}>
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
        {chunk(TILES, 2).map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((t, ci) => (
              <Animated.View key={t.label} style={{ flex: 1 }} entering={FadeInUp.delay((ri * 2 + ci) * 55).duration(380)}>
                <CalmTile label={t.label} glyph={t.glyph} colors={t.colors} route={t.route} />
              </Animated.View>
            ))}
          </View>
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
        <SecondaryLink label="Your journal" onPress={() => router.push('/journal')} />
        <SecondaryLink label="Explore the toolkit" onPress={() => router.push('/toolkit')} />
        <SecondaryLink label="My Calm Plan" onPress={() => router.push('/calm-plan')} />
        <SecondaryLink label="A letter from calm you" onPress={() => router.push('/letters')} />
        <SecondaryLink label="Settings & privacy" onPress={() => router.push('/settings')} />
      </View>
    </Screen>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function greeting() {
  switch (timeContext()) {
    case 'late-night':
      return 'Still awake?';
    case 'morning':
      return 'Good morning';
    case 'afternoon':
      return 'Good afternoon';
    case 'evening':
    default:
      return 'Good evening';
  }
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
  oneMinute: { marginTop: spacing.md, alignItems: 'center', paddingVertical: 6 },
  grid: { gap: 10, marginTop: spacing.lg },
  row: { flexDirection: 'row', gap: 10 },
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
