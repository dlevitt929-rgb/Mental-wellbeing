import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { Whisper } from '@/theme/Type';
import { BreathingTechnique, BreathingPhase } from '@/types';
import { useSettingsStore } from '@/store/useSettingsStore';
import { hexToRgba } from '@/utils/color';

interface BreathingOrbProps {
  technique: BreathingTechnique;
  running: boolean;
  onCycleComplete?: (cycleIndex: number) => void;
  onComplete?: () => void;
  onPhase?: (phase: BreathingPhase) => void;
}

const { width } = Dimensions.get('window');
const BASE_SIZE = Math.min(width * 0.62, 260);

const SCALE_FOR_PHASE: Record<BreathingPhase['key'], number> = {
  inhale: 1.28,
  inhale2: 1.42,
  hold: 1.42,
  exhale: 0.82,
  holdEmpty: 0.82,
};

export function BreathingOrb({ technique, running, onCycleComplete, onComplete, onPhase }: BreathingOrbProps) {
  const { palette } = useTheme();
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const scale = useSharedValue(0.85);
  const glow = useSharedValue(0.5);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycleIdx, setCycleIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedScaleRef = useRef(false);

  const phase = technique.phases[phaseIdx];

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    setPhaseIdx(0);
    setCycleIdx(0);
    startedScaleRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, technique.id]);

  useEffect(() => {
    if (!running) return;
    const current = technique.phases[phaseIdx];
    onPhase?.(current);
    const targetScale = SCALE_FOR_PHASE[current.key];
    scale.value = withTiming(targetScale, {
      duration: current.seconds * 1000,
      easing: Easing.inOut(Easing.sin),
    });
    glow.value = withTiming(current.key === 'exhale' || current.key === 'holdEmpty' ? 0.35 : 0.8, {
      duration: current.seconds * 1000,
      easing: Easing.inOut(Easing.sin),
    });

    if (hapticsEnabled && (current.key === 'inhale' || current.key === 'exhale')) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    timerRef.current = setTimeout(() => {
      const isLastPhase = phaseIdx === technique.phases.length - 1;
      if (isLastPhase) {
        const nextCycle = cycleIdx + 1;
        onCycleComplete?.(cycleIdx);
        if (nextCycle >= technique.cycles) {
          onComplete?.();
          return;
        }
        setCycleIdx(nextCycle);
        setPhaseIdx(0);
      } else {
        setPhaseIdx((i) => i + 1);
      }
    }, current.seconds * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIdx, cycleIdx, technique]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: scale.value * 1.25 }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          { width: BASE_SIZE, height: BASE_SIZE, borderRadius: BASE_SIZE, overflow: 'hidden' },
        ]}
      >
        <LinearGradient
          colors={[hexToRgba(palette.accentGradient[0], 0.35), hexToRgba(palette.accentGradient[1], 0)]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[orbStyle, { width: BASE_SIZE, height: BASE_SIZE, borderRadius: BASE_SIZE }]}>
        <LinearGradient
          colors={palette.accentGradient}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.9, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: BASE_SIZE }]}
        />
      </Animated.View>
      {running && (
        <Animated.View key={`${phaseIdx}-${cycleIdx}`} entering={FadeIn.duration(400)} exiting={FadeOut.duration(250)} style={styles.label}>
          <Whisper center color={palette.text}>
            {phase?.label}
          </Whisper>
        </Animated.View>
      )}
      {running && (
        <View style={styles.dots}>
          {Array.from({ length: technique.cycles }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i <= cycleIdx ? palette.accent : palette.border,
                  opacity: i <= cycleIdx ? 1 : 0.5,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute' },
  label: { position: 'absolute', top: '112%', width: 280 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 28 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
