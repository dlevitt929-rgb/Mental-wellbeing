import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { BodyMedium, Headline } from '@/theme/Type';
import { radii, spacing } from '@/theme/tokens';
import { useSettingsStore } from '@/store/useSettingsStore';

interface CalmButtonProps {
  label: string;
  sublabel?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'large' | 'medium' | 'small';
  style?: ViewStyle;
  haptic?: boolean;
}

export function CalmButton({
  label,
  sublabel,
  onPress,
  variant = 'secondary',
  size = 'medium',
  style,
  haptic = true,
}: CalmButtonProps) {
  const { palette } = useTheme();
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 120 });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 160 });
  };
  const handlePress = () => {
    if (haptic && hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
    }
    onPress();
  };

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  const paddingV = size === 'large' ? spacing.lg : size === 'small' ? spacing.sm : spacing.md;

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ borderRadius: radii.lg, overflow: 'hidden' }}
      >
        {isPrimary ? (
          <LinearGradient
            colors={palette.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.base, { paddingVertical: paddingV }]}
          >
            <Headline color="#1A1410" center>
              {label}
            </Headline>
            {sublabel ? (
              <BodyMedium color="#1A1410" center style={{ opacity: 0.75, marginTop: 2 }}>
                {sublabel}
              </BodyMedium>
            ) : null}
          </LinearGradient>
        ) : (
          <Animated.View
            style={[
              styles.base,
              { paddingVertical: paddingV },
              !isGhost && {
                backgroundColor: isDanger ? 'rgba(226,104,90,0.12)' : palette.surfaceRaised,
                borderWidth: 1,
                borderColor: isDanger ? 'rgba(226,104,90,0.35)' : palette.border,
              },
            ]}
          >
            <Headline color={isDanger ? palette.danger : palette.text} center>
              {label}
            </Headline>
            {sublabel ? (
              <BodyMedium color={palette.textMuted} center style={{ marginTop: 2 }}>
                {sublabel}
              </BodyMedium>
            ) : null}
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
