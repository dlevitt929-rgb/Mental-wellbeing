import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { Whisper, Body, Caption, Title } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { fonts } from '@/theme/useAppFonts';
import { TextInput, Pressable } from 'react-native';
import { useJournalSecurityStore, useJournalUnlockedStore } from '@/store/useJournalSecurityStore';
import { useHaptics } from '@/hooks/useHaptics';

export function JournalLockScreen() {
  const { palette } = useTheme();
  const biometricEnabled = useJournalSecurityStore((s) => s.biometricEnabled);
  const pinHash = useJournalSecurityStore((s) => s.pinHash);
  const unlock = useJournalUnlockedStore((s) => s.unlock);
  const { warning } = useHaptics();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [tryingBiometric, setTryingBiometric] = useState(biometricEnabled);

  useEffect(() => {
    if (!biometricEnabled) return;
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !enrolled) {
          setTryingBiometric(false);
          return;
        }
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock your journal',
        });
        if (result.success) {
          unlock();
        } else {
          setTryingBiometric(false);
        }
      } catch {
        setTryingBiometric(false);
      }
    })();
  }, [biometricEnabled, unlock]);

  const submitPin = async () => {
    if (!pinHash) return;
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
    if (hash === pinHash) {
      unlock();
    } else {
      warning();
      setError(true);
      setPin('');
    }
  };

  if (tryingBiometric) {
    return (
      <Screen center>
        <Whisper center>Unlocking your journal…</Whisper>
      </Screen>
    );
  }

  return (
    <Screen center>
      <View style={styles.block}>
        <Title center>This is just for you.</Title>
        <Body color={palette.textMuted} center style={{ marginTop: spacing.sm }}>
          Enter your PIN to open your journal.
        </Body>
        <TextInput
          value={pin}
          onChangeText={(v) => {
            setPin(v.replace(/[^0-9]/g, ''));
            setError(false);
          }}
          placeholder="••••"
          placeholderTextColor={palette.textFaint}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={8}
          style={[
            styles.input,
            { color: palette.text, borderColor: error ? palette.danger : palette.border, backgroundColor: palette.surface, fontFamily: fonts.body },
          ]}
          onSubmitEditing={submitPin}
        />
        {error && (
          <Caption color={palette.danger} style={{ marginTop: spacing.sm }}>
            That's not quite right. Try again.
          </Caption>
        )}
        <CalmButton
          label="Unlock"
          variant="primary"
          size="large"
          style={{ marginTop: spacing.lg, width: '100%' }}
          onPress={submitPin}
        />
        {biometricEnabled && (
          <Pressable onPress={() => setTryingBiometric(true)} style={{ marginTop: spacing.md }}>
            <Caption color={palette.accent}>Try Face ID / Touch ID again</Caption>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { width: '100%', alignItems: 'center', paddingHorizontal: spacing.lg },
  input: {
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
});
