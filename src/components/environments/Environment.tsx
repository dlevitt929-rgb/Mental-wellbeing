import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { GradientDrift } from './GradientDrift';
import { NightSky } from './NightSky';
import { RainStreaks } from './RainStreaks';
import { OceanFlow } from './OceanFlow';
import { FirePulse } from './FirePulse';
import { CloudDrift } from './CloudDrift';
import { EnvironmentId, EnvironmentProps } from './types';
import { hexToRgba } from '@/utils/color';

function intensityForPhase(phase: EnvironmentProps['breathPhase']): number {
  switch (phase) {
    case 'inhale':
    case 'inhale2':
    case 'hold':
      return 0.85;
    case 'exhale':
    case 'holdEmpty':
      return 0.15;
    default:
      return 0.35;
  }
}

interface Props extends EnvironmentProps {
  id: EnvironmentId;
}

/** Full-bleed animated backdrop for a session. Swap `id` to change mood; feed
 * breathPhase/phaseSeconds to have it move with the person's breathing. */
export function Environment({ id, breathPhase = null, warmth = 0, intensityOverride = null }: Props) {
  const intensity = intensityOverride ?? intensityForPhase(breathPhase);

  const warmthStyle = useAnimatedStyle(() => ({
    opacity: withTiming(warmth * 0.35, { duration: 1800 }),
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {renderEnvironment(id, intensity)}
      <Animated.View style={[StyleSheet.absoluteFill, warmthStyle]} pointerEvents="none">
        <LinearGradient
          colors={[hexToRgba('#E7A65C', 0.28), hexToRgba('#8E7CC3', 0)]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0.3 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

function renderEnvironment(id: EnvironmentId, intensity: number) {
  switch (id) {
    case 'ocean':
      return <OceanFlow breathIntensity={intensity} />;
    case 'night':
      return <NightSky breathIntensity={intensity} />;
    case 'rain':
      return (
        <>
          <NightSky breathIntensity={intensity} starCount={16} />
          <RainStreaks />
        </>
      );
    case 'fire':
      return <FirePulse breathIntensity={intensity} />;
    case 'forest':
      return (
        <GradientDrift
          colors={['#6FA37C', '#4C8060', '#2E5A42']}
          base={['#132018', '#0B140F']}
          breathIntensity={intensity}
        />
      );
    case 'clouds':
      return <CloudDrift colors={['#2B3550', '#3A4568']} breathIntensity={intensity} />;
    case 'sunset':
      return (
        <GradientDrift
          colors={['#E8A15F', '#C0658A', '#5C4A78']}
          base={['#2A1D2E', '#160E1C']}
          breathIntensity={intensity}
        />
      );
    case 'abstract':
    default:
      return (
        <GradientDrift
          colors={['#E7A65C', '#8E7CC3', '#5C87B8']}
          base={['#161B26', '#0E1219']}
          breathIntensity={intensity}
        />
      );
  }
}
