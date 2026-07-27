import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MessageBeat } from '@/components/MessageBeat';
import { Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { shuffledWords } from '@/data/cognitiveShuffle';

export function CognitiveShufflePlayer({ onDone }: { onDone: () => void }) {
  const { palette } = useTheme();
  const words = useMemo(() => shuffledWords(24), []);

  return (
    <View style={styles.wrap}>
      <Caption color={palette.textFaint} style={{ marginBottom: spacing.lg }}>
        Just notice each word. Nothing to do with them.
      </Caption>
      <MessageBeat beats={words.map((w) => ({ text: w, holdMs: 2200 }))} onDone={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
});
