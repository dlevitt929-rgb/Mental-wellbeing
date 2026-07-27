import React, { useState } from 'react';
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { WhisperLarge, Body, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { useSettingsStore } from '@/store/useSettingsStore';
import { fonts } from '@/theme/useAppFonts';

const STEPS = ['promise', 'name', 'privacy'] as const;

export default function Onboarding() {
  const { palette } = useTheme();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const setStoredName = useSettingsStore((s) => s.setName);
  const setHasOnboarded = useSettingsStore((s) => s.setHasOnboarded);

  const finish = () => {
    if (name.trim()) setStoredName(name.trim());
    setHasOnboarded(true);
    router.replace('/home');
  };

  const current = STEPS[step];

  return (
    <Screen center>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {current === 'promise' && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.block}>
            <WhisperLarge center>When this feels like too much,</WhisperLarge>
            <WhisperLarge center style={{ marginTop: 4 }}>
              I'll be here until it passes.
            </WhisperLarge>
            <Body color={palette.textMuted} center style={{ marginTop: spacing.lg }}>
              Ebb isn't a course, a streak, or a dashboard. It's here for the moments that feel
              too big — right now, not eventually.
            </Body>
            <CalmButton
              label="Continue"
              variant="primary"
              size="large"
              style={{ marginTop: spacing.xl }}
              onPress={() => setStep(1)}
            />
          </Animated.View>
        )}

        {current === 'name' && (
          <Animated.View entering={FadeInDown.duration(450)} style={styles.block}>
            <WhisperLarge center>What should I call you?</WhisperLarge>
            <Body color={palette.textMuted} center style={{ marginTop: spacing.sm }}>
              Totally optional.
            </Body>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={palette.textFaint}
              style={[
                styles.input,
                { color: palette.text, borderColor: palette.border, backgroundColor: palette.surface, fontFamily: fonts.body },
              ]}
              returnKeyType="done"
              onSubmitEditing={() => setStep(2)}
            />
            <CalmButton
              label="Continue"
              variant="primary"
              size="large"
              style={{ marginTop: spacing.xl }}
              onPress={() => setStep(2)}
            />
            <CalmButton label="Skip" variant="ghost" onPress={() => setStep(2)} style={{ marginTop: spacing.sm }} />
          </Animated.View>
        )}

        {current === 'privacy' && (
          <Animated.View entering={FadeInDown.duration(450)} style={styles.block}>
            <WhisperLarge center>What you write here stays on your device.</WhisperLarge>
            <Body color={palette.textMuted} center style={{ marginTop: spacing.lg }}>
              Everything you tell Ebb — thoughts, letters, worries, contacts — is stored only on
              this phone. Nothing is uploaded, sold, or shared. You can clear it at any time in
              Settings.
            </Body>
            <Caption color={palette.textFaint} center style={{ marginTop: spacing.lg }}>
              Ebb offers support in the moment. It doesn't replace professional care or emergency
              services.
            </Caption>
            <CalmButton label="I'm ready" variant="primary" size="large" style={{ marginTop: spacing.xl }} onPress={finish} />
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', paddingHorizontal: spacing.md },
  input: {
    marginTop: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 17,
  },
});
