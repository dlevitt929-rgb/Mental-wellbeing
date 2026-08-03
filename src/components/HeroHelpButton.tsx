import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { Headline, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';
import { hexToRgba } from '@/utils/color';
import { useHaptics } from '@/hooks/useHaptics';
import { useCalmMotion } from '@/hooks/useCalmMotion';

/**
 * The one thing on Home that is never a tile, never competes for attention,
 * and never waits for a transition animation — this has to work instantly,
 * every time, for someone who cannot wait.
 */
export function HeroHelpButton() {
  const { palette } = useTheme();
  const { gentleArrival } = useHaptics();
  const { reduced } = useCalmMotion();
  const press = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    pulse.value = withRepeat(withTiming(1, { duration: 3200 }), -1, true);
  }, [reduced, pulse]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.98]) }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.5, 0.85]),
  }));

  return (
    <Animated.View style={cardStyle}>
      <Pressable
        onPressIn={() => {
          press.value = withTiming(1, { duration: 100 });
        }}
        onPressOut={() => {
          press.value = withTiming(0, { duration: 180 });
        }}
        onPress={() => {
          gentleArrival();
          router.push('/panic?feeling=panicking');
        }}
        style={styles.wrap}
      >
        <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
          <LinearGradient
            colors={[hexToRgba(palette.accentGradient[0], 0.5), hexToRgba(palette.accentGradient[1], 0.35)]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        <LinearGradient
          colors={palette.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          <View>
            <Headline color="#1A1410">I need help right now</Headline>
            <Caption color="#1A1410" style={{ marginTop: 2, opacity: 0.75 }}>
              One tap. No questions first.
            </Caption>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radii.lg, overflow: 'hidden' },
  fill: { paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
});
