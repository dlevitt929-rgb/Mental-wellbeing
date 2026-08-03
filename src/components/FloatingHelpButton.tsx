import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme/ThemeProvider';
import { Caption } from '@/theme/Type';
import { radii, spacing } from '@/theme/tokens';
import { useHaptics } from '@/hooks/useHaptics';

/** Always one tap away, on every non-emergency screen. */
export function FloatingHelpButton() {
  const { palette, scheme } = useTheme();
  const { gentleArrival } = useHaptics();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.container, style]} pointerEvents="box-none">
      <Pressable
        onPressIn={() => {
          scale.value = withTiming(0.95, { duration: 100 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 140 });
        }}
        onPress={() => {
          gentleArrival();
          router.push('/panic');
        }}
      >
        <BlurView intensity={40} tint={scheme === 'light' ? 'light' : 'dark'} style={[styles.pill, { borderColor: palette.border }]}>
          <Caption color={palette.text}>I need help right now</Caption>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
  },
  pill: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.round,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
