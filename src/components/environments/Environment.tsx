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
import { useTheme } from '@/theme/ThemeProvider';

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
 * breathPhase/phaseSeconds to have it move with the person's breathing.
 * Every environment also adapts to the active light/dark scheme — same
 * place, same calm, different quality of light. */
export function Environment({ id, breathPhase = null, warmth = 0, intensityOverride = null }: Props) {
  const { scheme } = useTheme();
  const intensity = intensityOverride ?? intensityForPhase(breathPhase);
  const isLight = scheme === 'light';

  const warmthStyle = useAnimatedStyle(() => ({
    opacity: withTiming(warmth * 0.35, { duration: 1800 }),
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {renderEnvironment(id, intensity, isLight)}
      <Animated.View style={[StyleSheet.absoluteFill, warmthStyle]} pointerEvents="none">
        <LinearGradient
          colors={isLight ? [hexToRgba('#E0985A', 0.24), hexToRgba('#9583C9', 0)] : [hexToRgba('#E7A65C', 0.28), hexToRgba('#8E7CC3', 0)]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0.3 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

function renderEnvironment(id: EnvironmentId, intensity: number, isLight: boolean) {
  const scheme = isLight ? 'light' : 'dark';
  switch (id) {
    case 'ocean':
      return <OceanFlow breathIntensity={intensity} scheme={scheme} />;
    case 'night':
      return <NightSky breathIntensity={intensity} scheme={scheme} />;
    case 'rain':
      return (
        <>
          <NightSky breathIntensity={intensity} starCount={16} scheme={scheme} />
          <RainStreaks scheme={scheme} />
        </>
      );
    case 'fire':
      return <FirePulse breathIntensity={intensity} scheme={scheme} />;
    case 'forest':
      return isLight ? (
        <GradientDrift
          colors={['#9FCBA3', '#7BB489', '#E4D28E']}
          base={['#EEF6E4', '#DFF0D8']}
          breathIntensity={intensity}
        />
      ) : (
        <GradientDrift
          colors={['#6FA37C', '#4C8060', '#2E5A42']}
          base={['#132018', '#0B140F']}
          breathIntensity={intensity}
        />
      );
    case 'clouds':
      return (
        <CloudDrift
          colors={isLight ? ['#BFE0F5', '#DCEEFB'] : ['#2B3550', '#3A4568']}
          breathIntensity={intensity}
        />
      );
    case 'sunset':
      return isLight ? (
        <GradientDrift
          colors={['#F6C077', '#F2A15F', '#E8875C']}
          base={['#FCEBD2', '#F8DAB8']}
          breathIntensity={intensity}
        />
      ) : (
        <GradientDrift
          colors={['#E8A15F', '#C0658A', '#5C4A78']}
          base={['#2A1D2E', '#160E1C']}
          breathIntensity={intensity}
        />
      );
    case 'abstract':
    default:
      return isLight ? (
        <GradientDrift
          colors={['#F0B87A', '#B7A3DE', '#9FC0E0']}
          base={['#FBF3E6', '#F3E9F5']}
          breathIntensity={intensity}
        />
      ) : (
        <GradientDrift
          colors={['#E7A65C', '#8E7CC3', '#5C87B8']}
          base={['#161B26', '#0E1219']}
          breathIntensity={intensity}
        />
      );
  }
}
