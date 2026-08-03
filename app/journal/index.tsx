import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect } from 'react-native-svg';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { JournalLockScreen } from '@/components/JournalLockScreen';
import { Title, Body, Headline, Caption } from '@/theme/Type';
import { fonts } from '@/theme/useAppFonts';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useJournalStore } from '@/store/useJournalStore';
import { useJournalGate } from '@/hooks/useJournalGate';
import { formatShortTimestamp, dayKey } from '@/utils/formatDate';
import { MOOD_BY_ID } from '@/data/moods';
import { WEATHER_BY_MOOD } from '@/data/weather';
import { JournalEntry } from '@/types';
import { useNavigateWithWipe } from '@/engines/TransitionOverlay';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useHaptics } from '@/hooks/useHaptics';
import { derivePatternHints } from '@/engines/journalPatterns';
import { exportJournal } from '@/utils/journalExport';
import { useLongPressActions, ShortcutSheet } from '@/components/LongPressMenu';
import { EmptyState } from '@/components/EmptyState';

export default function JournalHome() {
  const unlocked = useJournalGate();
  if (!unlocked) return <JournalLockScreen />;
  return <JournalHomeContent />;
}

function JournalHomeContent() {
  const { palette } = useTheme();
  const entries = useJournalStore((s) => s.entries);
  const patternHintsEnabled = useSettingsStore((s) => s.journalPatternHintsEnabled);
  const [query, setQuery] = useState('');
  const [dayFilter, setDayFilter] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...entries].sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        return b.createdAt - a.createdAt;
      }),
    [entries],
  );
  const weatherStrip = useMemo(
    () => [...sorted].filter((e) => e.mood).slice(0, 7).reverse(),
    [sorted],
  );
  const patternHints = useMemo(
    () => (patternHintsEnabled ? derivePatternHints(entries) : []),
    [entries, patternHintsEnabled],
  );

  const days = useMemo(() => {
    const seen = new Map<string, number>();
    for (const e of sorted) {
      const key = dayKey(e.createdAt);
      if (!seen.has(key)) seen.set(key, e.createdAt);
    }
    return Array.from(seen.entries()).slice(0, 14);
  }, [sorted]);

  const filtered = useMemo(() => {
    return sorted.filter((e) => {
      if (dayFilter && dayKey(e.createdAt) !== dayFilter) return false;
      if (query.trim() && !e.text.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [sorted, dayFilter, query]);

  return (
    <Screen scroll overlay={<JournalLockLink />}>
      <View style={styles.header}>
        <Title style={{ marginTop: spacing.lg }}>What's on your mind?</Title>
        <Body color={palette.textMuted} style={{ marginTop: spacing.sm }}>
          A private place to put things down, just for you.
        </Body>
      </View>

      {weatherStrip.length >= 3 && (
        <View style={styles.weatherStrip}>
          {weatherStrip.map((e) => {
            const w = WEATHER_BY_MOOD[e.mood as keyof typeof WEATHER_BY_MOOD];
            const color = MOOD_BY_ID[e.mood as keyof typeof MOOD_BY_ID].color;
            return (
              <View key={e.id} style={styles.weatherDay}>
                <Caption color={color}>{w.glyph}</Caption>
              </View>
            );
          })}
        </View>
      )}

      <WriteButton />

      {patternHints.length > 0 && (
        <View style={[styles.hintsBox, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          {patternHints.map((line, i) => (
            <Caption key={i} color={palette.textMuted} style={{ marginBottom: i === patternHints.length - 1 ? 0 : 6 }}>
              {line}
            </Caption>
          ))}
        </View>
      )}

      {entries.length > 0 && (
        <>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search your journal"
            placeholderTextColor={palette.textFaint}
            style={[
              styles.search,
              { color: palette.text, borderColor: palette.border, backgroundColor: palette.surface, fontFamily: fonts.body },
            ]}
          />

          {days.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }} contentContainerStyle={{ gap: 8 }}>
              <DayChip label="All" active={dayFilter === null} onPress={() => setDayFilter(null)} />
              {days.map(([key, ts]) => (
                <DayChip
                  key={key}
                  label={formatShortTimestamp(ts).split(' · ')[0]}
                  active={dayFilter === key}
                  onPress={() => setDayFilter(dayFilter === key ? null : key)}
                />
              ))}
            </ScrollView>
          )}
        </>
      )}

      <View style={{ marginTop: spacing.lg, gap: 10 }}>
        {filtered.length === 0 && entries.length > 0 && (
          <EmptyState
            glyph="⌕"
            message="I couldn't find anything matching that."
            secondary="Try clearing your search, a different word, or browse by date below."
            actionLabel={query.trim() ? 'Clear search' : undefined}
            onAction={query.trim() ? () => setQuery('') : undefined}
          />
        )}
        {entries.length === 0 && (
          <EmptyState
            glyph="✎"
            message="This is a place to put down what you're carrying."
            secondary="You don't need to know where to begin."
            actionLabel="Write something"
            onAction={() => router.push('/journal/new')}
          />
        )}
        {filtered.map((e, i) => (
          <Animated.View key={e.id} entering={FadeInUp.delay(Math.min(i, 8) * 40).duration(320)}>
            <EntryCard entry={e} />
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

function WriteButton() {
  const { palette } = useTheme();
  const haptics = useHaptics();
  const press = useSharedValue(0);
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.97]) }] }));

  return (
    <Animated.View style={[cardStyle, { marginTop: spacing.lg }]}>
      <Pressable
        onPressIn={() => { press.value = withTiming(1, { duration: 100 }); }}
        onPressOut={() => { press.value = withTiming(0, { duration: 180 }); }}
        onPress={() => {
          haptics.gentleArrival();
          router.push('/journal/new');
        }}
        style={styles.writeWrap}
      >
        <LinearGradient colors={palette.accentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.writeFill}>
          <Headline color="#1A1410">✎ Write</Headline>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function DayChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.dayChip,
        { backgroundColor: active ? palette.accent : palette.surface, borderColor: palette.border },
      ]}
    >
      <Caption color={active ? '#1A1410' : palette.textMuted}>{label}</Caption>
    </Pressable>
  );
}

function EntryCard({ entry }: { entry: JournalEntry }) {
  const { palette } = useTheme();
  const ref = useRef<View>(null);
  const navigateWithWipe = useNavigateWithWipe();
  const togglePin = useJournalStore((s) => s.togglePin);
  const removeEntry = useJournalStore((s) => s.remove);
  const mood = entry.mood ? MOOD_BY_ID[entry.mood] : null;
  const snippet = entry.text.trim().split('\n')[0].slice(0, 90) || 'Empty entry';

  const confirmDelete = () => {
    Alert.alert('Delete this entry?', "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeEntry(entry.id) },
    ]);
  };

  const actions = [
    { label: entry.pinned ? 'Unpin' : 'Pin', onPress: () => togglePin(entry.id) },
    { label: 'Edit', onPress: () => router.push({ pathname: '/journal/new', params: { id: entry.id } }) },
    { label: 'Export', onPress: () => exportJournal([entry]) },
    { label: 'Delete', onPress: confirmDelete },
  ];
  const { visible, open, close } = useLongPressActions(actions.length);

  return (
    <>
      <Pressable
        ref={ref}
        onPress={() => navigateWithWipe(ref, mood?.color ?? palette.surfaceRaised, `/journal/${entry.id}`)}
        onLongPress={open}
        delayLongPress={420}
        style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
        accessibilityHint="Double tap and hold to pin, edit, export, or delete"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          {entry.pinned && <Caption color={palette.accent}>📌</Caption>}
          {mood && (
            <Caption color={mood.color}>{WEATHER_BY_MOOD[entry.mood as keyof typeof WEATHER_BY_MOOD].glyph}</Caption>
          )}
          <Caption color={palette.textFaint}>{formatShortTimestamp(entry.createdAt)}</Caption>
        </View>
        <Body numberOfLines={2}>{snippet}</Body>
        <Pressable
          onPress={open}
          hitSlop={10}
          style={styles.moreDot}
          accessibilityLabel="More options for this entry"
          accessibilityRole="button"
        >
          <Caption color={palette.textFaint}>•••</Caption>
        </Pressable>
      </Pressable>
      <ShortcutSheet visible={visible} onClose={close} actions={actions} title="Entry" />
    </>
  );
}

function JournalLockLink() {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={() => router.push('/journal/privacy')}
      style={styles.lockLink}
      hitSlop={10}
      accessibilityLabel="Journal privacy"
    >
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path
          d="M7 10.5V8a5 5 0 0 1 10 0v2.5"
          stroke={palette.textMuted}
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
        />
        <Rect x={5} y={10.5} width={14} height={10} rx={2.4} fill={palette.textMuted} opacity={0.85} />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.sm },
  search: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
  },
  dayChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.round, borderWidth: 1 },
  writeWrap: { borderRadius: radii.lg, overflow: 'hidden' },
  writeFill: { paddingVertical: spacing.md, alignItems: 'center' },
  card: { padding: spacing.md, borderRadius: radii.md, borderWidth: 1, paddingRight: 40 },
  moreDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintsBox: { marginTop: spacing.lg, padding: spacing.md, borderRadius: radii.md, borderWidth: 1 },
  weatherStrip: { flexDirection: 'row', gap: 10, marginTop: spacing.md, alignItems: 'center' },
  weatherDay: { alignItems: 'center', justifyContent: 'center' },
  lockLink: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
