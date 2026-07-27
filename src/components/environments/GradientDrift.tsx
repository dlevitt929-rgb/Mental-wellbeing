import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useSlowLoop } from './useSlowLoop';
import { useSmoothedNumber } from './useSmoothedNumber';
import { useCalmMotion } from '@/hooks/useCalmMotion';
import { hexToRgba } from '@/utils/color';

const { width, height } = Dimensions.get('window');

interface Blob {
  color: string;
  size: number;
  x: number;
  y: number;
  period: number;
  driftX: number;
  driftY: number;
}

interface GradientDriftProps {
  colors: [string, string, string];
  /** A dim base wash so the mood reads even where no blob currently overlaps. */
  base?: [string, string];
  /** 0 = settled, 1 = expanded — nudges scale/opacity up on inhale. */
  breathIntensity?: number;
}

/** Three soft, slowly-drifting glow blobs — the base "flowing gradient" atmosphere. */
export function GradientDrift({ colors, base, breathIntensity = 0.4 }: GradientDriftProps) {
  const { reduced } = useCalmMotion();

  const blobs = useMemo<Blob[]>(
    () => [
      { color: colors[0], size: width * 1.1, x: -width * 0.3, y: -height * 0.15, period: 14000, driftX: 30, driftY: 20 },
      { color: colors[1], size: width * 0.95, x: width * 0.35, y: height * 0.3, period: 18000, driftX: -24, driftY: 26 },
      { color: colors[2], size: width * 0.85, x: -width * 0.1, y: height * 0.62, period: 21000, driftX: 22, driftY: -18 },
    ],
    [colors],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {base && (
        <LinearGradient colors={base} style={StyleSheet.absoluteFill} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} />
      )}
      {blobs.map((b, i) => (
        <DriftBlob key={i} blob={b} reduced={reduced} breathIntensity={breathIntensity} />
      ))}
    </View>
  );
}

function DriftBlob({ blob, reduced, breathIntensity }: { blob: Blob; reduced: boolean; breathIntensity: number }) {
  const loop = useSlowLoop(blob.period, reduced, 0);
  const smoothIntensity = useSmoothedNumber(breathIntensity);

  const style = useAnimatedStyle(() => {
    const tx = interpolate(loop.value, [0, 1], [-blob.driftX, blob.driftX]);
    const ty = interpolate(loop.value, [0, 1], [-blob.driftY, blob.driftY]);
    const breathScale = 1 + smoothIntensity.value * 0.08;
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { scale: breathScale }],
      opacity: 0.55 + smoothIntensity.value * 0.15,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: blob.size,
          height: blob.size,
          borderRadius: blob.size / 2,
          overflow: 'hidden',
          left: blob.x,
          top: blob.y,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[hexToRgba(blob.color, 0.55), hexToRgba(blob.color, 0)]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
