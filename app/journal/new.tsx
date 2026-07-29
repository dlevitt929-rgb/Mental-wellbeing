import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { JournalLockScreen } from '@/components/JournalLockScreen';
import { CalmButton } from '@/components/CalmButton';
import { Caption, Whisper } from '@/theme/Type';
import { fonts } from '@/theme/useAppFonts';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { hexToRgba } from '@/utils/color';
import { useJournalStore } from '@/store/useJournalStore';
import { useJournalGate } from '@/hooks/useJournalGate';
import { useSettingsStore } from '@/store/useSettingsStore';
import { MOODS } from '@/data/moods';
import { WEATHER_BY_MOOD } from '@/data/weather';
import { JOURNAL_PROMPTS } from '@/data/journalPrompts';
import { Mood } from '@/types';

export default function JournalNew() {
  const unlocked = useJournalGate();
  if (!unlocked) return <JournalLockScreen />;
  return <JournalWriteScreen />;
}

function JournalWriteScreen() {
  const { palette } = useTheme();
  const params = useLocalSearchParams<{ id?: string; prefill?: string }>();
  const getById = useJournalStore((s) => s.getById);
  const createEntry = useJournalStore((s) => s.create);
  const updateEntry = useJournalStore((s) => s.update);
  const removeEntry = useJournalStore((s) => s.remove);
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const existing = params.id ? getById(params.id) : undefined;
  const [entryId, setEntryId] = useState<string | null>(existing?.id ?? null);
  const [text, setText] = useState(existing?.text ?? params.prefill ?? '');
  const [mood, setMood] = useState<Mood | undefined>(existing?.mood);
  const [showPrompts, setShowPrompts] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNew = !existing;

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (entryId) {
        updateEntry(entryId, { text, mood });
      } else if (text.trim().length > 0) {
        const id = createEntry(text, mood);
        setEntryId(id);
      }
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, mood]);

  const wordCount = text.trim().length ? text.trim().split(/\s+/).length : 0;

  const finish = () => {
    router.back();
  };

  const confirmDelete = () => {
    if (!entryId) return;
    Alert.alert('Delete this entry?', "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeEntry(entryId);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen backdrop={<Environment id={calmEnvironment} warmth={0.1} />}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        {isNew && text.trim().length === 0 && (
          <Pressable onPress={() => setShowPrompts((v) => !v)} style={{ marginBottom: spacing.sm }}>
            <Caption color={palette.accent}>{showPrompts ? 'Hide prompts' : 'Need a prompt?'}</Caption>
          </Pressable>
        )}

        {showPrompts && text.trim().length === 0 && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginBottom: spacing.lg, gap: 8 }}>
            {JOURNAL_PROMPTS.map((p) => (
              <Pressable
                key={p}
                onPress={() => {
                  setText(p + '\n\n');
                  setShowPrompts(false);
                }}
                style={[styles.promptChip, { borderColor: palette.border, backgroundColor: palette.surface }]}
              >
                <Caption color={palette.textMuted}>{p}</Caption>
              </Pressable>
            ))}
          </Animated.View>
        )}

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Write whatever is true right now…"
          placeholderTextColor={palette.textFaint}
          style={[styles.input, { color: palette.text, fontFamily: fonts.body }]}
          multiline
          autoFocus
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Caption color={palette.textFaint} style={{ marginBottom: spacing.sm }}>
          What's the weather like in there right now? (optional)
        </Caption>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {MOODS.map((m) => {
            const active = mood === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => {
                  if (hapticsEnabled) Haptics.selectionAsync().catch(() => {});
                  setMood(active ? undefined : m.id);
                }}
                style={[
                  styles.moodChip,
                  {
                    borderColor: active ? m.color : palette.border,
                    backgroundColor: active ? hexToRgba(m.color, 0.18) : palette.surface,
                  },
                ]}
              >
                <Caption color={active ? palette.text : palette.textMuted}>
                  {WEATHER_BY_MOOD[m.id].glyph} {m.label}
                </Caption>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.bottomRow}>
          {wordCount > 0 && <Caption color={palette.textFaint}>{wordCount} words</Caption>}
          <View style={{ flex: 1 }} />
          {entryId && (
            <Pressable onPress={confirmDelete} style={{ marginRight: spacing.md }}>
              <Caption color={palette.danger}>Delete</Caption>
            </Pressable>
          )}
          <CalmButton label="Done" variant="primary" onPress={finish} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: spacing.md },
  input: { fontSize: 17, lineHeight: 26, minHeight: 220 },
  promptChip: { padding: spacing.sm, borderRadius: radii.md, borderWidth: 1 },
  footer: { paddingTop: spacing.sm, paddingBottom: spacing.sm },
  moodChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.round, borderWidth: 1 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
});
