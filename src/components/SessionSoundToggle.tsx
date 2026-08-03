import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useHaptics } from '@/hooks/useHaptics';

/** Small, unobtrusive mute toggle — only ever shown while a session's ambient sound is active. */
export function SessionSoundToggle() {
  const { scheme } = useTheme();
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const { selection } = useHaptics();
  const iconColor = scheme === 'light' ? '#2E2A22' : '#F3F1EC';

  return (
    <Pressable
      style={styles.wrap}
      onPress={() => {
        selection();
        setSoundEnabled(!soundEnabled);
      }}
      hitSlop={12}
    >
      <BlurView intensity={35} tint={scheme === 'light' ? 'light' : 'dark'} style={styles.pill}>
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Path d="M4 9v6h4l5 5V4L8 9H4z" fill={iconColor} opacity={0.9} />
          {soundEnabled ? (
            <Path
              d="M16.5 8.5a5 5 0 0 1 0 7"
              stroke={iconColor}
              strokeWidth={1.6}
              strokeLinecap="round"
              fill="none"
              opacity={0.75}
            />
          ) : (
            <Line x1={17} y1={7} x2={22} y2={17} stroke={iconColor} strokeWidth={1.6} strokeLinecap="round" opacity={0.85} />
          )}
        </Svg>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
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
