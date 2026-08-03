import React, { useRef } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { Callout } from '@/theme/Type';
import { fonts } from '@/theme/useAppFonts';
import { radii, spacing } from '@/theme/tokens';
import { hexToRgba } from '@/utils/color';
import { useHaptics } from '@/hooks/useHaptics';
import { useNavigateWithWipe } from '@/engines/TransitionOverlay';
import { useCalmMotion } from '@/hooks/useCalmMotion';
import { useVisualTier } from '@/hooks/useVisualTier';
import { useLongPressActions, ShortcutSheet, LongPressAction } from '@/components/LongPressMenu';

interface CalmTileProps {
  label: string;
  glyph: string;
  colors: [string, string];
  route: string;
  wide?: boolean;
  /** Optional quick shortcuts revealed on long-press — never the only way
   *  to reach these, the tile still opens its normal flow on a plain tap. */
  actions?: LongPressAction[];
}

export function CalmTile({ label, glyph, colors, route, wide, actions = [] }: CalmTileProps) {
  const { palette } = useTheme();
  const { gentleArrival } = useHaptics();
  const navigateWithWipe = useNavigateWithWipe();
  const { reduced } = useCalmMotion();
  const tier = useVisualTier();
  const ref = useRef<View>(null);
  const { visible, open, close } = useLongPressActions(actions.length);

  const press = useSharedValue(0);
  const drift = useSharedValue(0);

  React.useEffect(() => {
    // With up to eight tiles on screen at once, this ambient drift is the
    // single biggest thing Home is animating continuously — skip it below Full.
    if (reduced || tier !== 'full') return;
    drift.value = withRepeat(withTiming(1, { duration: 7000 + Math.random() * 3000 }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, tier]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.96]) }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(press.value, [0, 1], [0.5, 0.85]),
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [-8, 8]) },
      { translateY: interpolate(drift.value, [0, 1], [-6, 6]) },
    ],
  }));

  const handlePress = () => {
    gentleArrival();
    navigateWithWipe(ref, colors[0], route);
  };

  return (
    <Animated.View style={[{ flex: wide ? undefined : 1, width: wide ? '100%' : undefined }, cardStyle]}>
      <Pressable
        ref={ref}
        onPress={handlePress}
        onLongPress={actions.length > 0 ? open : undefined}
        delayLongPress={420}
        onPressIn={() => {
          press.value = withTiming(1, { duration: 120 });
        }}
        onPressOut={() => {
          press.value = withTiming(0, { duration: 220 });
        }}
        style={[styles.tile, { borderColor: hexToRgba(colors[0], 0.28) }]}
        accessibilityHint={actions.length > 0 ? 'Double tap and hold for quick shortcuts' : undefined}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.surface }]} />
        <Animated.View style={[styles.glow, glowStyle]}>
          <LinearGradient
            colors={[hexToRgba(colors[0], 0.32), hexToRgba(colors[1], 0)]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.9, y: 1 }}
          />
        </Animated.View>
        <Text style={[styles.glyph, { color: colors[0], fontFamily: fonts.displayItalicMedium }]}>{glyph}</Text>
        <Callout style={{ marginTop: 10 }}>{label}</Callout>
        {actions.length > 0 && (
          <Pressable
            onPress={open}
            hitSlop={10}
            style={styles.moreDot}
            accessibilityLabel={`More options for ${label}`}
            accessibilityRole="button"
          >
            <Text style={{ color: colors[0], fontSize: 14 }}>•••</Text>
          </Pressable>
        )}
      </Pressable>
      <ShortcutSheet visible={visible} onClose={close} actions={actions} title={label} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 120,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '140%',
    height: '140%',
    top: '-20%',
    left: '-20%',
  },
  glyph: {
    fontSize: 26,
  },
  moreDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
