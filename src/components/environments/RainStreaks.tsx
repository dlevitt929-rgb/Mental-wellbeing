import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolate } from 'react-native-reanimated';
import { useCalmMotion } from '@/hooks/useCalmMotion';

const { width, height } = Dimensions.get('window');

interface Streak {
  x: number;
  length: number;
  duration: number;
  delay: number;
  opacity: number;
}

/** Soft rain streaks drifting down, like rain on a window at night. Overlay on top of NightSky. */
export function RainStreaks({ count = 18 }: { count?: number }) {
  const { reduced } = useCalmMotion();
  const streaks = useMemo<Streak[]>(
    () =>
      Array.from({ length: count }, () => ({
        x: Math.random() * width,
        length: 60 + Math.random() * 70,
        duration: 2600 + Math.random() * 2200,
        delay: Math.random() * 3000,
        opacity: 0.08 + Math.random() * 0.14,
      })),
    [count],
  );

  if (reduced) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {streaks.map((s, i) => (
        <Drop key={i} streak={s} />
      ))}
    </View>
  );
}

function Drop({ streak }: { streak: Streak }) {
  const v = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      v.value = withRepeat(withTiming(1, { duration: streak.duration, easing: Easing.linear }), -1, false);
    }, streak.delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(v.value, [0, 1], [-streak.length, height + streak.length]) }],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: streak.x, width: 1.5, height: streak.length }, style]}>
      <LinearGradient
        colors={['rgba(200,210,230,0)', `rgba(200,210,230,${streak.opacity})`, 'rgba(200,210,230,0)']}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
