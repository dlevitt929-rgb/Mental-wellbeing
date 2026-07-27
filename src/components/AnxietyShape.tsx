import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const { width } = Dimensions.get('window');
const CANVAS = Math.min(width * 0.8, 320);
const CENTER = CANVAS / 2;
const POINTS = 10;

function smoothClosedPath(pts: { x: number; y: number }[]): string {
  'worklet';
  const n = pts.length;
  let d = `M ${pts[0].x} ${pts[0].y} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y} `;
  }
  return d + 'Z';
}

interface AnxietyShapeProps {
  /** 0 = calmest/smallest, 1 = biggest/most chaotic. Externally controlled or user-dragged. */
  intensity: number;
  animateSettle?: boolean;
}

export function AnxietyShape({ intensity, animateSettle }: AnxietyShapeProps) {
  const { palette } = useTheme();
  const progress = useSharedValue(intensity);
  const rotation = useSharedValue(0);

  const seeds = useMemo(
    () => Array.from({ length: POINTS }, () => 0.55 + Math.random() * 0.9),
    [],
  );

  React.useEffect(() => {
    progress.value = withTiming(intensity, { duration: animateSettle ? 1400 : 250 });
  }, [intensity, animateSettle, progress]);

  React.useEffect(() => {
    rotation.value = withRepeat(withTiming(Math.PI * 2, { duration: 26000 }), -1, false);
  }, [rotation]);

  const animatedProps = useAnimatedProps(() => {
    const baseRadius = 46 + progress.value * 74;
    const chaos = 0.08 + progress.value * 0.4;
    const pts = seeds.map((seed, i) => {
      const angle = (i / POINTS) * Math.PI * 2 + rotation.value * 0.15;
      const wobble = Math.sin(rotation.value * 2 + i * 1.7) * chaos;
      const r = baseRadius * (1 + (seed - 1) * chaos + wobble * 0.25);
      return {
        x: CENTER + Math.cos(angle) * r,
        y: CENTER + Math.sin(angle) * r,
      };
    });
    return { d: smoothClosedPath(pts) };
  });

  return (
    <View style={styles.wrap}>
      <Svg width={CANVAS} height={CANVAS}>
        <AnimatedPath animatedProps={animatedProps} fill={palette.accent} opacity={0.85} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
