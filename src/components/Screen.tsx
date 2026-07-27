import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { hexToRgba } from '@/utils/color';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  center?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  /** Rendered above the scrollable content, fixed to the viewport — for things like a floating help button. */
  overlay?: React.ReactNode;
}

export function Screen({ children, scroll, center, padded = true, style, overlay }: ScreenProps) {
  const { palette } = useTheme();
  const Container = scroll ? ScrollView : View;

  // A barely-there presence: the whole app rests at a slow, calm breathing rate,
  // even when no exercise is running — so it never feels like a static, dead screen.
  const presence = useSharedValue(0.16);
  useEffect(() => {
    presence.value = withRepeat(
      withTiming(0.3, { duration: 5500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [presence]);
  const presenceStyle = useAnimatedStyle(() => ({ opacity: presence.value }));

  return (
    <View style={[styles.fill, { backgroundColor: palette.bg }]}>
      <LinearGradient
        colors={palette.bgGradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Animated.View style={[StyleSheet.absoluteFill, presenceStyle]} pointerEvents="none">
        <LinearGradient
          colors={[hexToRgba(palette.accentGradient[0], 0.16), hexToRgba(palette.accentGradient[1], 0)]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
        />
      </Animated.View>
      <SafeAreaView style={styles.fill}>
        <Animated.View entering={FadeIn.duration(420)} style={styles.fill}>
          <Container
            style={[styles.fill, style]}
            contentContainerStyle={
              scroll ? [padded && s.padded, center && s.center] : undefined
            }
            {...(!scroll ? { } : { showsVerticalScrollIndicator: false })}
          >
            {!scroll ? (
              <View style={[styles.fill, padded && s.padded, center && s.center]}>{children}</View>
            ) : (
              children
            )}
          </Container>
          {overlay}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

const s = StyleSheet.create({
  padded: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  center: { flexGrow: 1, justifyContent: 'center' },
});
