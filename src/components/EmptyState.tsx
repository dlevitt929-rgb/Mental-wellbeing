import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Body, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';

interface Props {
  glyph?: string;
  /** The one warm line explaining what this space is for — never "Nothing here yet." */
  message: string;
  /** A softer second line, when the message benefits from a little more reassurance. */
  secondary?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** One shared shape for every empty state in the app — a glyph, a warm
 *  sentence, and at most one clear action. No guilt language, no clutter. */
export function EmptyState({ glyph = '○', message, secondary, actionLabel, onAction }: Props) {
  const { palette } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(420)} style={styles.wrap}>
      <Body color={palette.textFaint} style={styles.glyph}>
        {glyph}
      </Body>
      <Body color={palette.textMuted} center style={styles.message}>
        {message}
      </Body>
      {secondary && (
        <Caption color={palette.textFaint} center style={{ marginTop: 8 }}>
          {secondary}
        </Caption>
      )}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={[styles.action, { borderColor: palette.accent }]}
          accessibilityRole="button"
        >
          <Caption color={palette.accent}>{actionLabel}</Caption>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  glyph: { fontSize: 22, marginBottom: spacing.sm, opacity: 0.7 },
  message: { lineHeight: 24, maxWidth: 280 },
  action: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderRadius: radii.round,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});
