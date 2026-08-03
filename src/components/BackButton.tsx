import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useHaptics } from '@/hooks/useHaptics';

interface Props {
  /** Overrides the default router.back() — for screens that need to flush
   *  state or run their own cleanup before leaving. */
  onPress?: () => void;
}

/** The one consistent way to leave a screen, everywhere it appears. Falls
 *  back to Home only when there's genuinely nothing to go back to (a cold
 *  deep link, a fresh reload) — otherwise it always retraces the real path
 *  that got you here. */
export function BackButton({ onPress }: Props) {
  const { palette, scheme } = useTheme();
  const { selection } = useHaptics();

  const handlePress = () => {
    selection();
    if (onPress) {
      onPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.wrap} hitSlop={12} accessibilityLabel="Go back" accessibilityRole="button">
      <BlurView intensity={35} tint={scheme === 'light' ? 'light' : 'dark'} style={styles.pill}>
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Path
            d="M15 5l-7 7 7 7"
            stroke={scheme === 'light' ? '#2E2A22' : '#F3F1EC'}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
  },
  pill: {
    width: 36,
    height: 36,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
