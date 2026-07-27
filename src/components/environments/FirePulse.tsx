import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useSmoothedNumber } from './useSmoothedNumber';
import { useCalmMotion } from '@/hooks/useCalmMotion';

const { width, height } = Dimensions.get('window');

interface FirePulseProps {
  breathIntensity?: number;
}

/** A warm, irregular glow rising from the bottom of the screen — like firelight, not a literal fire. */
export function FirePulse({ breathIntensity = 0.4 }: FirePulseProps) {
  const { reduced } = useCalmMotion();
  const flickerA = useFlicker(2600, reduced);
  const flickerB = useFlicker(3900, reduced, 400);
  const smoothIntensity = useSmoothedNumber(breathIntensity);

  const style = useAnimatedStyle(() => {
    const flicker = (flickerA.value + flickerB.value) / 2;
    return {
      opacity: 0.5 + flicker * 0.25 + smoothIntensity.value * 0.15,
      transform: [{ scale: 1 + flicker * 0.04 + smoothIntensity.value * 0.05 }],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={['#150E0A', '#1C120C', '#120B08']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, style]}>
        <LinearGradient colors={['rgba(231,166,92,0.4)', 'rgba(231,166,92,0)']} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

function useFlicker(duration: number, reduced: boolean, delay = 0) {
  const v = useSharedValue(reduced ? 0.5 : 0);
  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => {
      v.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  return v;
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    bottom: -height * 0.25,
    left: width * 0.5 - width * 0.6,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    overflow: 'hidden',
  },
});
