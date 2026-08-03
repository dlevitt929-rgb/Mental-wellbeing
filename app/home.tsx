import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { CalmTile } from '@/components/CalmTile';
import { HeroHelpButton } from '@/components/HeroHelpButton';
import { OfflineBanner } from '@/components/OfflineBanner';
import { LongPressMenu, LongPressAction } from '@/components/LongPressMenu';
import { Title, Body, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useWorryStore, selectPendingFromBefore } from '@/store/useWorryStore';
import { useSleepMemoryStore, getRepeatableSleepReason } from '@/store/useSleepMemoryStore';
import { useJournalStore } from '@/store/useJournalStore';
import { deriveInsights, getTopTechnique } from '@/engines/insights';
import { pickRightNowSuggestion, timeContext } from '@/engines/rightNow';
import { Feeling, Technique } from '@/types';
import { markStartup, useFrameDropWarnings } from '@/engines/perfInstrumentation';

interface TileDef {
  id: string;
  label: string;
  glyph: string;
  colors: [string, string];
  route: string;
  feeling?: Feeling;
}

const TILES: TileDef[] = [
  { id: 'cant-sleep', label: 'I can’t sleep', glyph: '☾', colors: ['#8A6F9E', '#5C6C8A'], route: '/sleep', feeling: 'cant-sleep' },
  { id: 'racing-thoughts', label: 'My mind won’t stop', glyph: '≈', colors: ['#7C93C3', '#8E7CC3'], route: '/racing-thoughts', feeling: 'racing-thoughts' },
  { id: 'overwhelmed', label: 'I feel overwhelmed', glyph: '◎', colors: ['#E2685A', '#D98E63'], route: '/panic?feeling=overwhelmed', feeling: 'overwhelmed' },
  { id: 'connection', label: 'I feel alone', glyph: '◐', colors: ['#9C8AD9', '#5C6C8A'], route: '/connection', feeling: 'alone' },
  { id: 'need-calm', label: 'I need to calm down', glyph: '⊙', colors: ['#E7A65C', '#8E7CC3'], route: '/panic?feeling=need-calm', feeling: 'need-calm' },
  { id: 'something-happened', label: 'Something happened', glyph: '✦', colors: ['#D98E63', '#9C5B7C'], route: '/panic?feeling=something-happened', feeling: 'something-happened' },
  { id: 'stay-with-me', label: 'Stay with me', glyph: '◉', colors: ['#E7A65C', '#C0658A'], route: '/stay-with-me', feeling: 'alone' },
  { id: 'dont-know', label: 'I don’t even know', glyph: '⋯', colors: ['#7C93C3', '#726F8A'], route: '/unsure', feeling: 'dont-know' },
];

const TECHNIQUE_ROUTE: Partial<Record<Technique, string>> = {
  breathing: '/toolkit/breathing',
  grounding: '/toolkit/grounding',
  pmr: '/toolkit/pmr',
  'body-scan': '/toolkit/body-scan',
  'cognitive-defusion': '/toolkit/defusion',
  'sensory-grounding': '/toolkit/sensory',
  movement: '/toolkit/movement',
  'self-compassion': '/toolkit/self-compassion',
  'worry-postponement': '/toolkit/worry-postponement',
  'emotional-regulation': '/toolkit/emotional-regulation',
  'hold-to-breathe': '/toolkit/hold-to-breathe',
  'guided-imagery': '/toolkit/guided-imagery',
  'follow-along': '/dont-think-just-follow',
  talking: '/stay-with-me?tab=talk',
  'stay-with-me': '/stay-with-me',
};

export default function Home() {
  const { palette } = useTheme();
  useFrameDropWarnings('home');
  useEffect(() => {
    markStartup('home-mounted');
  }, []);
  const name = useSettingsStore((s) => s.name);
  const sessions = useSessionStore((s) => s.sessions);
  const insights = useMemo(() => deriveInsights(sessions), [sessions]);
  const worries = useWorryStore((s) => s.worries);
  const pendingWorries = useMemo(() => selectPendingFromBefore(worries), [worries]);
  const resolveWorry = useWorryStore((s) => s.resolve);
  const rightNow = useMemo(() => pickRightNowSuggestion(sessions), [sessions]);
  const commonSituations = useSettingsStore((s) => s.commonSituations);
  const orderedTiles = useMemo(() => {
    if (commonSituations.length === 0) return TILES;
    // A gentle bias, not a reshuffle: whatever someone told us during
    // onboarding brings them here most often floats to the front, but
    // nothing disappears and the rest keep their original relative order.
    const matched = TILES.filter((t) => t.feeling && commonSituations.includes(t.feeling));
    const rest = TILES.filter((t) => !(t.feeling && commonSituations.includes(t.feeling)));
    return [...matched, ...rest];
  }, [commonSituations]);

  const topTechnique = useMemo(() => getTopTechnique(sessions), [sessions]);
  const favoriteEnvironment = useSettingsStore((s) => s.favoriteEnvironment);
  const sleepMemory = useSleepMemoryStore((s) => s);
  const repeatableSleepReason = getRepeatableSleepReason(sleepMemory);
  const journalEntries = useJournalStore((s) => s.entries);
  const latestDraft = useMemo(
    () => (journalEntries.length ? [...journalEntries].sort((a, b) => b.updatedAt - a.updatedAt)[0] : null),
    [journalEntries],
  );

  const tileActions = (tile: TileDef): LongPressAction[] => {
    if (tile.id === 'cant-sleep') {
      const actions: LongPressAction[] = [];
      if (repeatableSleepReason) {
        actions.push({
          label: 'Start the last sleep experience',
          onPress: () => router.push(`/sleep?reason=${repeatableSleepReason}`),
        });
      }
      if (favoriteEnvironment) {
        actions.push({
          label: 'Start my favourite soundscape',
          onPress: () => router.push(`/sleep?sound=${favoriteEnvironment}`),
        });
      }
      actions.push({
        label: 'Open Nothing to Solve Tonight',
        onPress: () => router.push('/sleep?direct=nothing-to-solve'),
      });
      return actions;
    }
    if (tile.id === 'need-calm') {
      const actions: LongPressAction[] = [];
      const topRoute = topTechnique ? TECHNIQUE_ROUTE[topTechnique] : undefined;
      if (topRoute) {
        actions.push({ label: 'Repeat what helped last time', onPress: () => router.push(topRoute) });
      }
      actions.push({ label: 'Start One Minute With Me', onPress: () => router.push('/one-minute') });
      actions.push({ label: "Start Don't Think, Just Follow", onPress: () => router.push('/dont-think-just-follow') });
      return actions;
    }
    if (tile.id === 'stay-with-me') {
      return [
        { label: 'Quiet presence', onPress: () => router.push('/stay-with-me?tab=quiet') },
        { label: 'Talk me through this', onPress: () => router.push('/stay-with-me?tab=talk') },
        { label: 'Just stay', onPress: () => router.push('/stay-with-me?tab=just-stay') },
      ];
    }
    return [];
  };

  const journalActions: LongPressAction[] = [
    { label: 'Start a new entry', onPress: () => router.push('/journal/new') },
    ...(latestDraft
      ? [
          {
            label: 'Continue the most recent draft',
            onPress: () => router.push({ pathname: '/journal/new', params: { id: latestDraft.id } }),
          },
        ]
      : []),
    { label: 'Record a voice note', onPress: () => router.push({ pathname: '/memories', params: { mode: 'record' } }) },
  ];

  return (
    <Screen scroll showBack={false}>
      <View style={styles.header}>
        <Body color={palette.textMuted}>{greeting()}{name ? `, ${name}` : ''}</Body>
        <Title style={{ marginTop: 6 }}>What's happening right now?</Title>
      </View>

      <OfflineBanner />

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
        {chunk(orderedTiles, 2).map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((t, ci) => (
              <Animated.View key={t.label} style={{ flex: 1 }} entering={FadeInUp.delay((ri * 2 + ci) * 55).duration(380)}>
                <CalmTile label={t.label} glyph={t.glyph} colors={t.colors} route={t.route} actions={tileActions(t)} />
              </Animated.View>
            ))}
          </View>
        ))}
      </View>

      {insights.length > 0 && (
        <Pressable
          onPress={() => router.push('/things-that-help')}
          style={[styles.insightsBox, { borderColor: palette.border, backgroundColor: palette.surface }]}
        >
          <Caption color={palette.textMuted}>{insights[0]}</Caption>
          <Caption color={palette.accent} style={{ marginTop: 4 }}>
            See what helps you →
          </Caption>
        </Pressable>
      )}

      <View style={styles.secondary}>
        <LongPressMenu
          actions={journalActions}
          title="Your journal"
          onPress={() => router.push('/journal')}
          style={({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.6 : 1, paddingVertical: 10 }]}
          accessibilityLabel="Your journal"
        >
          <Body color={palette.textMuted}>Your journal</Body>
        </LongPressMenu>
        <SecondaryLink label="Explore the toolkit" onPress={() => router.push('/toolkit')} />
        <SecondaryLink label="My Calm Plan" onPress={() => router.push('/calm-plan')} />
        <SecondaryLink label="A letter from calm you" onPress={() => router.push('/letters')} />
        <SecondaryLink label="Calm memories" onPress={() => router.push('/memories')} />
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
