import React from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { JournalLockScreen } from '@/components/JournalLockScreen';
import { CalmButton } from '@/components/CalmButton';
import { Body, Caption, Whisper } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { hexToRgba } from '@/utils/color';
import { useJournalStore } from '@/store/useJournalStore';
import { useJournalGate } from '@/hooks/useJournalGate';
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatFullTimestamp } from '@/utils/formatDate';
import { MOOD_BY_ID } from '@/data/moods';
import { WEATHER_BY_MOOD } from '@/data/weather';

export default function JournalEntryDetail() {
  const unlocked = useJournalGate();
  if (!unlocked) return <JournalLockScreen />;
  return <JournalEntryDetailContent />;
}

function JournalEntryDetailContent() {
  const { palette } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useJournalStore((s) => s.entries.find((e) => e.id === id));
  const removeEntry = useJournalStore((s) => s.remove);
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);

  if (!entry) {
    return (
      <Screen center>
        <Whisper center>This entry is gone.</Whisper>
        <CalmButton label="Back" variant="ghost" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  const mood = entry.mood ? MOOD_BY_ID[entry.mood] : null;

  const confirmDelete = () => {
    Alert.alert('Delete this entry?', "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeEntry(entry.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen
      scroll
      backdrop={<Environment id={calmEnvironment} warmth={0.15} />}
      overlay={
        <View style={styles.actions}>
          <Pressable onPress={() => router.push({ pathname: '/journal/new', params: { id: entry.id } })} style={styles.actionBtn}>
            <Caption color={palette.text}>Edit</Caption>
          </Pressable>
          <Pressable onPress={confirmDelete} style={styles.actionBtn}>
            <Caption color={palette.danger}>Delete</Caption>
          </Pressable>
        </View>
      }
    >
      <View style={{ marginTop: spacing.xxl, marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {mood && entry.mood && (
            <View style={[styles.moodPill, { backgroundColor: hexToRgba(mood.color, 0.18), borderColor: mood.color }]}>
              <Caption color={palette.text}>
                {WEATHER_BY_MOOD[entry.mood].glyph} {WEATHER_BY_MOOD[entry.mood].label}
              </Caption>
            </View>
          )}
          <Caption color={palette.textFaint}>{formatFullTimestamp(entry.createdAt)}</Caption>
        </View>
      </View>

      <Body style={{ lineHeight: 27 }}>{entry.text}</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { position: 'absolute', top: spacing.lg, right: spacing.lg, flexDirection: 'row', gap: spacing.md },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  moodPill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radii.round, borderWidth: 1 },
});
