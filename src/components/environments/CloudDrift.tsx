import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useSlowLoop } from './useSlowLoop';
import { useSmoothedNumber } from './useSmoothedNumber';
import { useCalmMotion } from '@/hooks/useCalmMotion';
import { hexToRgba } from '@/utils/color';

const { width, height } = Dimensions.get('window');

interface CloudDriftProps {
  colors: [string, string];
  breathIntensity?: number;
}

interface Puff {
  x: number;
  y: number;
  size: number;
  period: number;
  range: number;
}

/** Soft, wide blurred ellipses drifting sideways — clouds, or a stand-in for gentle daylight movement. */
export function CloudDrift({ colors, breathIntensity = 0.35 }: CloudDriftProps) {
  const { reduced } = useCalmMotion();
  const puffs = useMemo<Puff[]>(
    () => [
      { x: -width * 0.2, y: height * 0.12, size: width * 0.9, period: 26000, range: 40 },
      { x: width * 0.3, y: height * 0.28, size: width * 0.7, period: 32000, range: -34 },
      { x: -width * 0.1, y: height * 0.48, size: width * 0.8, period: 29000, range: 30 },
    ],
    [],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[colors[0], colors[1]]} style={StyleSheet.absoluteFill} />
      {puffs.map((p, i) => (
        <Puff key={i} puff={p} reduced={reduced} breathIntensity={breathIntensity} />
      ))}
    </View>
  );
}

function Puff({ puff, reduced, breathIntensity }: { puff: Puff; reduced: boolean; breathIntensity: number }) {
  const loop = useSlowLoop(puff.period, reduced);
  const smoothIntensity = useSmoothedNumber(breathIntensity);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(loop.value, [0, 1], [0, puff.range]) }],
    opacity: 0.45 + smoothIntensity.value * 0.15,
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: puff.x,
          top: puff.y,
          width: puff.size,
          height: puff.size * 0.55,
          borderRadius: puff.size * 0.3,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <LinearGradient colors={[hexToRgba('#FFFFFF', 0.5), hexToRgba('#FFFFFF', 0)]} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}
