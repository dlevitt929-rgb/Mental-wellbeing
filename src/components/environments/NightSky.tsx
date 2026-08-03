import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useSlowLoop } from './useSlowLoop';
import { useSmoothedNumber } from './useSmoothedNumber';
import { useCalmMotion } from '@/hooks/useCalmMotion';
import { useVisualTier } from '@/hooks/useVisualTier';

const { width, height } = Dimensions.get('window');

interface Star {
  x: number;
  y: number;
  size: number;
  period: number;
  delay: number;
  baseOpacity: number;
}

interface NightSkyProps {
  breathIntensity?: number;
  starCount?: number;
  scheme?: 'light' | 'dark';
}

/** Dark: a very dark, slow-moving night sky — soft moon glow, faint twinkling
 *  stars. Light: the same slot rendered as a soft sunrise — warm horizon
 *  glow, no stars, nothing that reads as "still night" in daylight. */
export function NightSky({ breathIntensity = 0.3, starCount = 34, scheme = 'dark' }: NightSkyProps) {
  const { reduced } = useCalmMotion();
  const tier = useVisualTier();
  const isLight = scheme === 'light';
  // Full skies look lovely but thirty-plus independently animated stars is
  // real work on a modest device — Reduced/Minimal keep the mood with fewer.
  const effectiveStarCount = tier === 'full' ? starCount : Math.min(starCount, 10);

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: effectiveStarCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.75,
        size: 1 + Math.random() * 2,
        period: 2400 + Math.random() * 3200,
        delay: Math.random() * 4000,
        baseOpacity: 0.25 + Math.random() * 0.55,
      })),
    [effectiveStarCount],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={isLight ? ['#FBE0C2', '#F6C9A6', '#EFDCE6'] : ['#05060A', '#0A0E16', '#050608']}
        style={StyleSheet.absoluteFill}
      />
      <MoonGlow breathIntensity={breathIntensity} reduced={reduced} isLight={isLight} />
      {!isLight && stars.map((s, i) => <Star key={i} star={s} reduced={reduced} />)}
    </View>
  );
}

function MoonGlow({ breathIntensity, reduced, isLight }: { breathIntensity: number; reduced: boolean; isLight: boolean }) {
  const loop = useSlowLoop(9000, reduced);
  const smoothIntensity = useSmoothedNumber(breathIntensity);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(loop.value, [0, 1], [0.35, 0.5]) + smoothIntensity.value * 0.1,
  }));
  const glowColors: [string, string] = isLight
    ? ['rgba(255,196,130,0.55)', 'rgba(255,196,130,0)']
    : ['rgba(180,190,220,0.35)', 'rgba(180,190,220,0)'];
  return (
    <Animated.View style={[styles.moon, style]}>
      <LinearGradient colors={glowColors} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function Star({ star, reduced }: { star: Star; reduced: boolean }) {
  const loop = useSlowLoop(star.period, reduced, star.delay);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(loop.value, [0, 1], [star.baseOpacity * 0.3, star.baseOpacity]),
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size,
          backgroundColor: '#F5F3EC',
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  moon: {
    position: 'absolute',
    top: height * 0.08,
    right: width * 0.12,
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
  },
});
