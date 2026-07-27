import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Display, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

/** A slow counting exercise. If you lose count, you just start again — there's no failing. */
export function CountingPlayer({ totalBreaths = 10, onDone }: { totalBreaths?: number; onDone: () => void }) {
  const { palette } = useTheme();
  const [count, setCount] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      if (count >= totalBreaths) onDone();
      else setCount((c) => c + 1);
    }, 4200);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <View style={styles.wrap}>
      <Caption color={palette.textFaint}>Count each breath. If you lose your place, just start again.</Caption>
      <Animated.View key={count} entering={FadeIn.duration(500)} exiting={FadeOut.duration(300)} style={{ marginTop: spacing.lg }}>
        <Display center>{count}</Display>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: spacing.md },
});
