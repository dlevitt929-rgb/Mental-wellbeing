import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Whisper } from '@/theme/Type';
import { CalmButton } from '@/components/CalmButton';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { useHaptics } from '@/hooks/useHaptics';

interface GroundingSequenceProps {
  steps: string[];
  onComplete: () => void;
  confirmLabel?: string;
}

export function GroundingSequence({ steps, onComplete, confirmLabel = 'Found it' }: GroundingSequenceProps) {
  const [index, setIndex] = useState(0);
  const { palette } = useTheme();
  const { softConfirmation } = useHaptics();

  const advance = () => {
    softConfirmation();
    if (index < steps.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.wrap}>
      <Animated.View key={index} entering={FadeIn.duration(420)} exiting={FadeOut.duration(220)} style={styles.textWrap}>
        <Whisper center>{steps[index]}</Whisper>
      </Animated.View>
      <View style={styles.dots}>
        {steps.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i <= index ? palette.accent : palette.border, opacity: i <= index ? 1 : 0.5 },
            ]}
          />
        ))}
      </View>
      <CalmButton label={confirmLabel} variant="primary" size="large" onPress={advance} style={{ marginTop: spacing.xl, width: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center' },
  textWrap: { minHeight: 100, justifyContent: 'center', paddingHorizontal: spacing.md },
  dots: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
