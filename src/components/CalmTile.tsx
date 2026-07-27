import React, { useRef } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
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
import { useSettingsStore } from '@/store/useSettingsStore';
import { useNavigateWithWipe } from '@/engines/TransitionOverlay';
import { useCalmMotion } from '@/hooks/useCalmMotion';

interface CalmTileProps {
  label: string;
  glyph: string;
  colors: [string, string];
  route: string;
  wide?: boolean;
}

export function CalmTile({ label, glyph, colors, route, wide }: CalmTileProps) {
  const { palette } = useTheme();
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const navigateWithWipe = useNavigateWithWipe();
  const { reduced } = useCalmMotion();
  const ref = useRef<View>(null);

  const press = useSharedValue(0);
  const drift = useSharedValue(0);

  React.useEffect(() => {
    if (reduced) return;
    drift.value = withRepeat(withTiming(1, { duration: 7000 + Math.random() * 3000 }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

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
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
    navigateWithWipe(ref, colors[0], route);
  };

  return (
    <Animated.View style={[{ flex: wide ? undefined : 1, width: wide ? '100%' : undefined }, cardStyle]}>
      <Pressable
        ref={ref}
        onPress={handlePress}
        onPressIn={() => {
          press.value = withTiming(1, { duration: 120 });
        }}
        onPressOut={() => {
          press.value = withTiming(0, { duration: 220 });
        }}
        style={[styles.tile, { borderColor: hexToRgba(colors[0], 0.28) }]}
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
      </Pressable>
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
});
