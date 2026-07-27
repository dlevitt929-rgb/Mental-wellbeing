import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Whisper, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { PMR_STEPS } from '@/data/bodyScripts';

export function PMRPlayer({ onDone }: { onDone: () => void }) {
  const { palette } = useTheme();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'tense' | 'release'>('tense');
  const step = PMR_STEPS[index];

  React.useEffect(() => {
    const holdMs = phase === 'tense' ? 3200 : 3600;
    const t = setTimeout(() => {
      if (phase === 'tense') {
        setPhase('release');
      } else if (index < PMR_STEPS.length - 1) {
        setIndex((i) => i + 1);
        setPhase('tense');
      } else {
        onDone();
      }
    }, holdMs);
    return () => clearTimeout(t);
  }, [index, phase]);

  return (
    <View style={styles.wrap}>
      <Caption color={palette.textFaint}>{step.muscle}</Caption>
      <Animated.View key={`${index}-${phase}`} entering={FadeIn.duration(400)} exiting={FadeOut.duration(250)} style={{ marginTop: spacing.sm }}>
        <Whisper center>{phase === 'tense' ? step.tense : step.release}</Whisper>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', minHeight: 160, justifyContent: 'center', paddingHorizontal: spacing.md },
});
