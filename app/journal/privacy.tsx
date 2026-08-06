import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Switch, TextInput, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body, Headline, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { fonts } from '@/theme/useAppFonts';
import { useJournalSecurityStore } from '@/store/useJournalSecurityStore';
import { useJournalStore } from '@/store/useJournalStore';
import { exportJournal } from '@/utils/journalExport';
import { useHaptics } from '@/hooks/useHaptics';

export default function JournalPrivacy() {
  const { palette } = useTheme();
  const lockEnabled = useJournalSecurityStore((s) => s.lockEnabled);
  const biometricEnabled = useJournalSecurityStore((s) => s.biometricEnabled);
  const pinHash = useJournalSecurityStore((s) => s.pinHash);
  const setLockEnabled = useJournalSecurityStore((s) => s.setLockEnabled);
  const setBiometricEnabled = useJournalSecurityStore((s) => s.setBiometricEnabled);
  const setPinHash = useJournalSecurityStore((s) => s.setPinHash);
  const entries = useJournalStore((s) => s.entries);
  const removeAll = useJournalStore((s) => s.removeAll);
  const { warning } = useHaptics();

  const [hasBiometricHardware, setHasBiometricHardware] = useState(false);
  const [settingPin, setSettingPin] = useState<null | 'first' | 'confirm'>(null);
  const [pinDraft, setPinDraft] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const hw = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometricHardware(hw && enrolled);
      } catch {
        setHasBiometricHardware(false);
      }
    })();
  }, []);

  const toggleLock = (v: boolean) => {
    if (v && !pinHash) {
      setSettingPin('first');
      return;
    }
    setLockEnabled(v);
    if (!v) setBiometricEnabled(false);
  };

  const submitPinStep = async () => {
    if (pinDraft.length < 4) {
      setPinError(true);
      return;
    }
    if (settingPin === 'first') {
      setFirstPin(pinDraft);
      setPinDraft('');
      setPinError(false);
      setSettingPin('confirm');
      return;
    }
    if (pinDraft !== firstPin) {
      setPinError(true);
      setPinDraft('');
      return;
    }
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pinDraft);
    await setPinHash(hash);
    setLockEnabled(true);
    setSettingPin(null);
    setPinDraft('');
    setFirstPin('');
    setPinError(false);
  };

  const clearJournal = () => {
    Alert.alert(
      'Delete every journal entry?',
      `This permanently removes all ${entries.length} entries from this device. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => {
            warning();
            removeAll();
          },
        },
      ],
    );
  };

  const handleExport = async () => {
    try {
      await exportJournal(entries);
    } catch {
      Alert.alert('Couldn’t export', 'Something went wrong preparing your export. Please try again.');
    }
  };

  if (settingPin) {
    return (
      <Screen center>
        <View style={styles.block}>
          <Title center>{settingPin === 'first' ? 'Choose a PIN' : 'Confirm your PIN'}</Title>
          <Body color={palette.textMuted} center style={{ marginTop: spacing.sm }}>
            {settingPin === 'first'
              ? "You'll use this to open your journal."
              : 'Enter it once more.'}
          </Body>
          <TextInput
            value={pinDraft}
            onChangeText={(v) => {
              setPinDraft(v.replace(/[^0-9]/g, ''));
              setPinError(false);
            }}
            placeholder="••••"
            placeholderTextColor={palette.textFaint}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
            autoFocus
            style={[
              styles.pinInput,
              { color: palette.text, borderColor: pinError ? palette.danger : palette.border, backgroundColor: palette.surface, fontFamily: fonts.body },
            ]}
            onSubmitEditing={submitPinStep}
          />
          {pinError && (
            <Caption color={palette.danger} style={{ marginTop: spacing.sm }}>
              {settingPin === 'confirm' ? "That doesn't match." : 'Use at least 4 digits.'}
            </Caption>
          )}
          <CalmButton label="Continue" variant="primary" size="large" style={{ marginTop: spacing.lg, width: '100%' }} onPress={submitPinStep} />
          <CalmButton
            label="Cancel"
            variant="ghost"
            onPress={() => {
              setSettingPin(null);
              setPinDraft('');
              setFirstPin('');
              setPinError(false);
            }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Title style={{ marginTop: spacing.lg }}>Journal privacy</Title>
      <Body color={palette.textMuted} style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
        Your journal is yours. It's stored only on this device, and never used for advertising.
      </Body>

      <Section title="Lock">
        <ToggleRow label="Require a PIN to open your journal" value={lockEnabled} onChange={toggleLock} />
        {lockEnabled && hasBiometricHardware && (
          <ToggleRow label="Also allow Face ID / Touch ID" value={biometricEnabled} onChange={setBiometricEnabled} />
        )}
        {lockEnabled && (
          <CalmButton label="Change PIN" style={{ marginTop: spacing.sm }} onPress={() => setSettingPin('first')} />
        )}
      </Section>

      <Section title="Your data">
        <Caption color={palette.textFaint} style={{ marginBottom: spacing.sm }}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} stored on this device
        </Caption>
        <CalmButton label="Export my journal" onPress={handleExport} style={{ marginBottom: spacing.sm }} />
        <CalmButton label="Delete all journal entries" variant="danger" onPress={clearJournal} />
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
  block: { width: '100%', alignItems: 'center', paddingHorizontal: spacing.lg },
  pinInput: {
    marginTop: spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 8,
  },
  section: { marginBottom: spacing.xl, padding: spacing.md, borderRadius: radii.md, borderWidth: 1 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
});
