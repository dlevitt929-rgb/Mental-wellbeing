import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { SessionSoundToggle } from '@/components/SessionSoundToggle';
import { Body, Whisper, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { hexToRgba } from '@/utils/color';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionAmbience } from '@/hooks/useSessionAmbience';

const { width } = Dimensions.get('window');
const BASE_SIZE = Math.min(width * 0.58, 240);
const INHALE_MS = 4200;
const EXHALE_MS = 6000;
const HAPTIC_INTERVAL_MS = 1400;

type Phase = 'idle' | 'in' | 'held' | 'out';

const PHASE_LABEL: Record<Phase, string> = {
  idle: 'Press and hold to breathe in.',
  in: 'Breathing in…',
  held: 'Hold. Let go whenever you’re ready.',
  out: 'Breathing out…',
};

/** No count, no timer — the breath is exactly as long as the person holds. */
export default function HoldToBreatheToolkit() {
  const { palette } = useTheme();
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const logTechnique = useSessionStore((s) => s.logTechnique);

  const [phase, setPhase] = useState<Phase>('idle');
  const [started, setStarted] = useState(false);
  const [intensity, setIntensity] = useState(0.15);
  const cyclesLogged = useRef(false);
  const pressedRef = useRef(false);

  const scale = useSharedValue(0.85);
  const glow = useSharedValue(0.35);

  const heldTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hapticInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useSessionAmbience(started, calmEnvironment, 0.22);

  const clearTimers = () => {
    if (heldTimeout.current) clearTimeout(heldTimeout.current);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (hapticInterval.current) clearInterval(hapticInterval.current);
  };

  useEffect(() => clearTimers, []);

  const pulse = useCallback(() => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [hapticsEnabled]);

  const onPressIn = () => {
    pressedRef.current = true;
    clearTimers();
    setStarted(true);
    setPhase('in');
    setIntensity(0.88);
    scale.value = withTiming(1.42, { duration: INHALE_MS, easing: Easing.inOut(Easing.sin) });
    glow.value = withTiming(0.85, { duration: INHALE_MS, easing: Easing.inOut(Easing.sin) });
    pulse();
    hapticInterval.current = setInterval(pulse, HAPTIC_INTERVAL_MS);
    heldTimeout.current = setTimeout(() => {
      if (pressedRef.current) setPhase('held');
    }, INHALE_MS);
  };

  const onPressOut = () => {
    if (!pressedRef.current) return;
    pressedRef.current = false;
    clearTimers();
    setPhase('out');
    setIntensity(0.15);
    scale.value = withTiming(0.85, { duration: EXHALE_MS, easing: Easing.inOut(Easing.sin) });
    glow.value = withTiming(0.35, { duration: EXHALE_MS, easing: Easing.inOut(Easing.sin) });
    if (!cyclesLogged.current) {
      cyclesLogged.current = true;
      logTechnique('hold-to-breathe');
    }
    idleTimeout.current = setTimeout(() => setPhase('idle'), EXHALE_MS);
  };

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value, transform: [{ scale: scale.value * 1.25 }] }));

  const finish = () => router.back();

  return (
    <Screen
      center
      backdrop={<Environment id={calmEnvironment} intensityOverride={intensity} warmth={0} />}
      overlay={started ? <SessionSoundToggle /> : undefined}
    >
      <View style={styles.block}>
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut} hitSlop={24} style={styles.orbWrap}>
          <Animated.View
            style={[
              styles.glow,
              glowStyle,
              { width: BASE_SIZE, height: BASE_SIZE, borderRadius: BASE_SIZE, overflow: 'hidden' },
            ]}
          >
            <LinearGradient
              colors={[hexToRgba(palette.accentGradient[0], 0.4), hexToRgba(palette.accentGradient[1], 0)]}
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
        </Pressable>

        <Animated.View key={phase} entering={FadeIn.duration(400)} style={{ marginTop: spacing.xl }}>
          <Whisper center>{PHASE_LABEL[phase]}</Whisper>
        </Animated.View>

        {!started && (
          <Body color={palette.textMuted} center style={{ marginTop: spacing.sm, maxWidth: 280 }}>
            There's no count to hit. Go as long or as little as feels right.
          </Body>
        )}
      </View>

      <Pressable onPress={finish} style={styles.exit}>
        <Caption color={palette.textFaint}>{started ? "I'm ready to go" : 'Not right now'}</Caption>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', width: '100%', paddingHorizontal: spacing.lg },
  orbWrap: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute' },
  exit: { position: 'absolute', bottom: 20, alignSelf: 'center', opacity: 0.5 },
});
