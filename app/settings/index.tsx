import React from 'react';
import { View, StyleSheet, Switch, Alert, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { FloatingHelpButton } from '@/components/FloatingHelpButton';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body, Headline, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useCalmPlanStore } from '@/store/useCalmPlanStore';
import { useContactsStore } from '@/store/useContactsStore';
import { useLettersStore } from '@/store/useLettersStore';
import { useWorryStore } from '@/store/useWorryStore';
import { useJournalStore } from '@/store/useJournalStore';
import { useMemoriesStore } from '@/store/useMemoriesStore';
import { EnvironmentPicker } from '@/components/EnvironmentPicker';
import { Appearance } from '@/store/useSettingsStore';

const APPEARANCE_OPTIONS: { id: Appearance; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'Follow System' },
];

export default function Settings() {
  const { palette } = useTheme();
  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const nightReminderEnabled = useSettingsStore((s) => s.nightReminderEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);
  const setNightReminderEnabled = useSettingsStore((s) => s.setNightReminderEnabled);
  const journalPatternHintsEnabled = useSettingsStore((s) => s.journalPatternHintsEnabled);
  const setJournalPatternHintsEnabled = useSettingsStore((s) => s.setJournalPatternHintsEnabled);
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  const sleepEnvironment = useSettingsStore((s) => s.sleepEnvironment);
  const setCalmEnvironment = useSettingsStore((s) => s.setCalmEnvironment);
  const setSleepEnvironment = useSettingsStore((s) => s.setSleepEnvironment);

  const sessions = useSessionStore((s) => s.sessions);
  const calmPlanCount = useCalmPlanStore((s) => s.entries.length);
  const contactsCount = useContactsStore((s) => s.contacts.length);
  const lettersCount = useLettersStore((s) => s.letters.length);
  const worriesCount = useWorryStore((s) => s.worries.length);
  const journalCount = useJournalStore((s) => s.entries.length);
  const memoriesCount = useMemoriesStore((s) => s.memories.length);

  const clearEverything = () => {
    Alert.alert(
      'Clear all your data?',
      'This removes every session, calm plan entry, letter, contact, worry, and journal entry stored on this device. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear everything',
          style: 'destructive',
          onPress: () => {
            useSessionStore.setState({ sessions: [], current: null });
            useCalmPlanStore.setState({ entries: [] });
            useContactsStore.setState({ contacts: [] });
            useLettersStore.setState({ letters: [] });
            useWorryStore.setState({ worries: [] });
            useJournalStore.setState({ entries: [] });
            useMemoriesStore.setState({ memories: [] });
          },
        },
      ],
    );
  };

  return (
    <Screen scroll overlay={<FloatingHelpButton />}>
      <Title style={{ marginTop: spacing.lg }}>Settings & privacy</Title>

      <Section title="Appearance">
        <Body color={palette.textMuted} style={{ marginBottom: spacing.sm }}>
          Choose how Ebb looks. Your choice applies everywhere, right away.
        </Body>
        <View style={styles.appearanceRow}>
          {APPEARANCE_OPTIONS.map((opt) => {
            const active = appearance === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setAppearance(opt.id)}
                style={[
                  styles.appearanceChip,
                  { borderColor: active ? palette.accent : palette.border, backgroundColor: active ? palette.surfaceRaised : 'transparent' },
                ]}
              >
                <Body color={active ? palette.text : palette.textMuted}>{opt.label}</Body>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title="Preferences">
        <ToggleRow label="Sound" value={soundEnabled} onChange={setSoundEnabled} />
        <ToggleRow label="Haptics" value={hapticsEnabled} onChange={setHapticsEnabled} />
        <ToggleRow
          label="Remind me about worries I set aside"
          value={nightReminderEnabled}
          onChange={setNightReminderEnabled}
        />
        <ToggleRow
          label="Gentle patterns in my journal"
          value={journalPatternHintsEnabled}
          onChange={setJournalPatternHintsEnabled}
        />
      </Section>

      <Section title="Where would you rather be">
        <Body color={palette.textMuted} style={{ marginBottom: spacing.sm }}>
          During breathing & calming sessions
        </Body>
        <EnvironmentPicker value={calmEnvironment} onChange={setCalmEnvironment} />
        <Body color={palette.textMuted} style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
          At night
        </Body>
        <EnvironmentPicker value={sleepEnvironment} onChange={setSleepEnvironment} options={['night', 'rain', 'ocean', 'clouds']} />
      </Section>

      <Section title="Your privacy">
        <Body color={palette.textMuted}>
          Everything you write in Ebb — sessions, letters, contacts, calm plan entries, worries,
          memories — is stored only on this device. Nothing is uploaded, sold, or shared with
          anyone, including us.
        </Body>
        <Caption color={palette.textFaint} style={{ marginTop: spacing.sm }}>
          Currently stored: {sessions.length} sessions · {calmPlanCount} calm plan entries ·{' '}
          {contactsCount} contacts · {lettersCount} letters · {worriesCount} worries ·{' '}
          {journalCount} journal entries · {memoriesCount} calm memories
        </Caption>
        <Pressable onPress={() => router.push('/journal/privacy')} style={{ marginTop: spacing.sm }}>
          <Caption color={palette.accent}>Journal lock, export & privacy →</Caption>
        </Pressable>
        <CalmButton label="Clear all my data" variant="danger" style={{ marginTop: spacing.md }} onPress={clearEverything} />
      </Section>

      <Section title="About Ebb">
        <Body color={palette.textMuted}>
          Ebb is here for the moments that feel too big, right now. It offers support in the
          moment — it doesn't replace professional mental health care.
        </Body>
        <Pressable onPress={() => router.push('/crisis')} style={{ marginTop: spacing.sm }}>
          <Caption color={palette.accent}>Crisis & emergency resources →</Caption>
        </Pressable>
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.section, { borderColor: palette.border, backgroundColor: palette.surface }]}>
      <Headline style={{ marginBottom: spacing.sm }}>{title}</Headline>
      {children}
    </View>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { palette } = useTheme();
  return (
    <View style={styles.toggleRow}>
      <Body style={{ flex: 1 }}>{label}</Body>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: palette.accent, false: palette.border }} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xl, padding: spacing.md, borderRadius: radii.md, borderWidth: 1 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  appearanceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  appearanceChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radii.round, borderWidth: 1 },
});
