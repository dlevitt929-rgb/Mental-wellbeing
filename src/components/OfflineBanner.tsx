import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useIsOffline } from '@/hooks/useIsOffline';

export function OfflineBanner() {
  const offline = useIsOffline();
  const { palette } = useTheme();
  if (!offline) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(280)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.wrap, { backgroundColor: palette.surface, borderColor: palette.border }]}
    >
      <Caption color={palette.textMuted} center>
        You're offline, but your saved tools and entries are still here.
      </Caption>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
});
