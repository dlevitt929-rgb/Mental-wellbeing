import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { MessageBeat } from '@/components/MessageBeat';
import { Whisper, Body } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { fonts } from '@/theme/useAppFonts';
import { useSessionStore } from '@/store/useSessionStore';

export default function DefusionToolkit() {
  const { palette } = useTheme();
  const [thought, setThought] = useState('');
  const [stage, setStage] = useState<'write' | 'reframe' | 'done'>('write');
  const logTechnique = useSessionStore((s) => s.logTechnique);

  if (stage === 'done') {
    return (
      <Screen center>
        <Whisper center>That’s a thought, not a fact.</Whisper>
        <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  if (stage === 'reframe') {
    return (
      <Screen center>
        <MessageBeat
          beats={[
            { text: `“I’m having the thought that ${thought.toLowerCase()}.”`, holdMs: 4200 },
            { text: 'Not "this is true" — just "my mind produced this."', holdMs: 4200 },
            { text: 'Thoughts pass through. They don’t need your agreement.', holdMs: 4000 },
          ]}
          onDone={() => {
            logTechnique('cognitive-defusion');
            setStage('done');
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen center>
      <View style={styles.block}>
        <Whisper center>What's a thought that's stuck on repeat?</Whisper>
        <Body color={palette.textMuted} center style={{ marginTop: spacing.sm }}>
          Write it exactly as it sounds in your head.
        </Body>
        <TextInput
          value={thought}
          onChangeText={setThought}
          placeholder="e.g. I'm going to mess this up"
          placeholderTextColor={palette.textFaint}
          style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.surface, fontFamily: fonts.body }]}
          multiline
        />
        <CalmButton
          label="Continue"
          variant="primary"
          size="large"
          style={{ marginTop: spacing.lg, width: '100%' }}
          onPress={() => thought.trim() && setStage('reframe')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { width: '100%', alignItems: 'center', paddingHorizontal: spacing.md },
  input: {
    marginTop: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 70,
    textAlignVertical: 'top',
  },
});
