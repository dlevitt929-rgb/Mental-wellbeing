import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeOut,
  ZoomOut,
  LinearTransition,
} from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body, Whisper, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';
import { useSessionOnMount } from '@/hooks/useSessionOnMount';
import { useJournalStore } from '@/store/useJournalStore';
import { fonts } from '@/theme/useAppFonts';
import { generateId } from '@/utils/id';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/useSettingsStore';

type Category = 'deal-tomorrow' | 'not-in-control' | 'just-a-thought' | 'important' | 'let-go';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'deal-tomorrow', label: 'Deal with tomorrow' },
  { id: 'not-in-control', label: 'Not in my control' },
  { id: 'just-a-thought', label: 'Just a thought' },
  { id: 'important', label: 'Important' },
  { id: 'let-go', label: 'Let go' },
];

interface Thought {
  id: string;
  text: string;
  rotation: number;
  category?: Category;
}

export default function RacingThoughts() {
  const { palette } = useTheme();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [input, setInput] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const endSession = useSessionStore((s) => s.end);
  const createJournalEntry = useJournalStore((s) => s.create);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const [savedToJournal, setSavedToJournal] = useState(false);
  const categorizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useSessionOnMount('racing-thoughts');

  useEffect(() => {
    return () => {
      if (categorizeTimer.current) clearTimeout(categorizeTimer.current);
    };
  }, []);

  const activeCount = thoughts.filter((t) => !t.category).length;

  const addThought = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setThoughts((t) => [
      ...t,
      { id: generateId(), text, rotation: Math.random() * 6 - 3 },
    ]);
    if (hapticsEnabled) Haptics.selectionAsync().catch(() => {});
  };

  const categorize = (id: string, category: Category) => {
    logTechnique('cognitive-defusion');
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setOpenId(null);
    if (categorizeTimer.current) clearTimeout(categorizeTimer.current);
    categorizeTimer.current = setTimeout(() => {
      setThoughts((t) => t.map((th) => (th.id === id ? { ...th, category } : th)));
    }, 80);
  };

  const finish = () => {
    endSession();
    router.replace({ pathname: '/reflection', params: { feeling: 'racing-thoughts' } });
  };

  const saveThoughtsToJournal = () => {
    const text = thoughts.map((t) => `• ${t.text}`).join('\n');
    createJournalEntry(text);
    logTechnique('journaling');
    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSavedToJournal(true);
  };

  const categorizedCount = thoughts.length - activeCount;
  const warmth = thoughts.length > 0 ? Math.min(0.6, (categorizedCount / thoughts.length) * 0.6) : 0;

  return (
    <Screen backdrop={<Environment id="abstract" warmth={warmth} />}>
      <View style={styles.header}>
        <Title>Empty my head</Title>
        <Body color={palette.textMuted} style={{ marginTop: 6 }}>
          Type each thought as it comes. You don't have to solve any of them right now.
        </Body>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.pile} showsVerticalScrollIndicator={false}>
        {thoughts
          .filter((t) => !t.category)
          .map((t) => (
            <Animated.View
              key={t.id}
              entering={FadeInDown.springify().damping(14)}
              exiting={ZoomOut.duration(320)}
              layout={LinearTransition}
              style={[
                styles.card,
                {
                  backgroundColor: palette.surfaceRaised,
                  borderColor: palette.border,
                  transform: [{ rotate: `${t.rotation}deg` }],
                },
              ]}
            >
              <Pressable onPress={() => setOpenId(openId === t.id ? null : t.id)}>
                <Body>{t.text}</Body>
              </Pressable>
              {openId === t.id && (
                <Animated.View entering={FadeInDown.duration(200)} style={styles.chipRow}>
                  {CATEGORIES.map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => categorize(t.id, c.id)}
                      style={[styles.chip, { borderColor: palette.border }]}
                    >
                      <Caption color={palette.textMuted}>{c.label}</Caption>
                    </Pressable>
                  ))}
                </Animated.View>
              )}
            </Animated.View>
          ))}

        {thoughts.length >= 3 && activeCount === 0 && (
          <Animated.View entering={FadeInDown.duration(500)} style={{ marginTop: spacing.lg, alignItems: 'center' }}>
            <Whisper center>These thoughts can exist without you solving them right now.</Whisper>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.inputRow, { borderColor: palette.border, backgroundColor: palette.surface }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="What's circling right now?"
          placeholderTextColor={palette.textFaint}
          style={[styles.input, { color: palette.text, fontFamily: fonts.body }]}
          onSubmitEditing={addThought}
          returnKeyType="done"
        />
        <Pressable onPress={addThought}>
          <Caption color={palette.accent}>Add</Caption>
        </Pressable>
      </View>

      {thoughts.length > 0 && (
        <>
          {!savedToJournal ? (
            <CalmButton
              label="Save these as a journal entry"
              variant="ghost"
              style={{ marginTop: spacing.md }}
              onPress={saveThoughtsToJournal}
            />
          ) : (
            <Caption color={palette.textFaint} style={{ marginTop: spacing.md, textAlign: 'center' }}>
              Saved to your journal.
            </Caption>
          )}
          <CalmButton label="I'm done for now" variant="primary" style={{ marginTop: spacing.sm }} onPress={finish} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  pile: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: spacing.lg, alignContent: 'flex-start' },
  card: { padding: spacing.md, borderRadius: radii.md, borderWidth: 1, maxWidth: '80%' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: radii.round, borderWidth: 1 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: { flex: 1, fontSize: 16 },
});
