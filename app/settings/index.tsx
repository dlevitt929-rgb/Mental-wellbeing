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

export default function Settings() {
  const { palette } = useTheme();
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const nightReminderEnabled = useSettingsStore((s) => s.nightReminderEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);
  const setNightReminderEnabled = useSettingsStore((s) => s.setNightReminderEnabled);

  const sessions = useSessionStore((s) => s.sessions);
  const calmPlanCount = useCalmPlanStore((s) => s.entries.length);
  const contactsCount = useContactsStore((s) => s.contacts.length);
  const lettersCount = useLettersStore((s) => s.letters.length);
  const worriesCount = useWorryStore((s) => s.worries.length);

  const clearEverything = () => {
    Alert.alert(
      'Clear all your data?',
      'This removes every session, calm plan entry, letter, contact, and worry stored on this device. This can’t be undone.',
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
          },
        },
      ],
    );
  };

  return (
    <Screen scroll overlay={<FloatingHelpButton />}>
      <Title style={{ marginTop: spacing.lg }}>Settings & privacy</Title>

      <Section title="Preferences">
        <ToggleRow label="Sound" value={soundEnabled} onChange={setSoundEnabled} />
        <ToggleRow label="Haptics" value={hapticsEnabled} onChange={setHapticsEnabled} />
        <ToggleRow
          label="Remind me about worries I set aside"
          value={nightReminderEnabled}
          onChange={setNightReminderEnabled}
        />
      </Section>

      <Section title="Your privacy">
        <Body color={palette.textMuted}>
          Everything you write in Ebb — sessions, letters, contacts, calm plan entries, worries —
          is stored only on this device. Nothing is uploaded, sold, or shared with anyone,
          including us.
        </Body>
        <Caption color={palette.textFaint} style={{ marginTop: spacing.sm }}>
          Currently stored: {sessions.length} sessions · {calmPlanCount} calm plan entries ·{' '}
          {contactsCount} contacts · {lettersCount} letters · {worriesCount} worries
        </Caption>
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
});
