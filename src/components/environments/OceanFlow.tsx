import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useCalmMotion } from '@/hooks/useCalmMotion';

const { width, height } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface OceanFlowProps {
  breathIntensity?: number;
}

function wavePath(phase: number, baseY: number, amp: number): string {
  'worklet';
  const w = width;
  const points = 6;
  let d = `M 0 ${baseY}`;
  for (let i = 0; i <= points; i++) {
    const x = (w / points) * i;
    const y = baseY + Math.sin(phase + i * 1.1) * amp;
    d += ` L ${x} ${y}`;
  }
  d += ` L ${w} ${height} L 0 ${height} Z`;
  return d;
}

export function OceanFlow({ breathIntensity = 0.4 }: OceanFlowProps) {
  const { reduced } = useCalmMotion();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={['#0E1B24', '#132430', '#0B151C']} style={StyleSheet.absoluteFill} />
      <Wave baseY={height * 0.62} amp={14 + breathIntensity * 10} color="#3E6E7C" opacity={0.35} duration={9000} reduced={reduced} />
      <Wave baseY={height * 0.72} amp={10 + breathIntensity * 8} color="#5C8A93" opacity={0.3} duration={12000} reduced={reduced} reverse />
      <Wave baseY={height * 0.84} amp={8 + breathIntensity * 6} color="#8FA9AC" opacity={0.22} duration={15000} reduced={reduced} />
    </View>
  );
}

function Wave({
  baseY,
  amp,
  color,
  opacity,
  duration,
  reduced,
  reverse,
}: {
  baseY: number;
  amp: number;
  color: string;
  opacity: number;
  duration: number;
  reduced: boolean;
  reverse?: boolean;
}) {
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    phase.value = withRepeat(
      withTiming(reverse ? -Math.PI * 2 : Math.PI * 2, { duration, easing: Easing.linear }),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const animatedProps = useAnimatedProps(() => ({ d: wavePath(phase.value, baseY, amp) }));

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <AnimatedPath animatedProps={animatedProps} fill={color} opacity={opacity} />
    </Svg>
  );
}
