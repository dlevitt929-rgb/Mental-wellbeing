import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { CalmButton } from '@/components/CalmButton';
import { Whisper, Body, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { useSessionAmbience } from '@/hooks/useSessionAmbience';
import { useSessionOnMount } from '@/hooks/useSessionOnMount';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionStore } from '@/store/useSessionStore';

const STEPS: { prompt: string; awayMs: number }[] = [
  { prompt: 'Look at the farthest object in the room. Really look at it.', awayMs: 9000 },
  { prompt: 'Find something with a texture nearby. Touch it.', awayMs: 9000 },
  { prompt: 'Notice a color you haven’t noticed yet today.', awayMs: 8000 },
  { prompt: 'Listen for the quietest sound in the room.', awayMs: 9000 },
  { prompt: 'Look at your own hands for a moment.', awayMs: 7000 },
];

const READ_MS = 3400;

type Stage = 'reveal' | 'away' | 'done';

/** The phone dims and steps back on purpose — the point is to look at the
 *  actual room, not the screen. Haptics mark the moment to look back, not text. */
export default function ComeBackToTheRoom() {
  const { palette } = useTheme();
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const endSession = useSessionStore((s) => s.end);

  const [stepIndex, setStepIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('reveal');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pulseInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const dim = useSharedValue(0);

  useSessionOnMount('overwhelmed');
  useSessionAmbience(stage !== 'done', calmEnvironment, 0.18);

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (pulseInterval.current) clearInterval(pulseInterval.current);
  };

  useEffect(() => {
    if (stage === 'done') return undefined;
    if (stage === 'reveal') {
      dim.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.sin) });
      const t = setTimeout(() => setStage('away'), READ_MS);
      timers.current.push(t);
    } else if (stage === 'away') {
      dim.value = withTiming(0.93, { duration: 1200, easing: Easing.inOut(Easing.sin) });
      const awayMs = STEPS[stepIndex].awayMs;
      if (hapticsEnabled) {
        pulseInterval.current = setInterval(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }, 2500);
      }
      const t = setTimeout(() => {
        if (pulseInterval.current) clearInterval(pulseInterval.current);
        if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        const isLast = stepIndex === STEPS.length - 1;
        if (isLast) {
          logTechnique('look-away-grounding');
          setStage('done');
        } else {
          setStepIndex((i) => i + 1);
          setStage('reveal');
        }
      }, awayMs);
      timers.current.push(t);
    }
    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, stepIndex]);

  useEffect(() => clearAll, []);

  const dimStyle = useAnimatedStyle(() => ({ opacity: dim.value }));

  const finish = () => {
    endSession();
    router.back();
  };

  const leave = () => {
    clearAll();
    endSession();
    router.back();
  };

  return (
    <Screen center backdrop={<Environment id={calmEnvironment} warmth={stepIndex / STEPS.length} />}>
      <View style={styles.block}>
        {stage !== 'done' ? (
          <Animated.View key={stepIndex} entering={FadeIn.duration(500)}>
            <Whisper center>{STEPS[stepIndex].prompt}</Whisper>
            {stage === 'away' && (
              <Body color={palette.textMuted} center style={{ marginTop: spacing.md }}>
                You'll feel a tap when it's time to come back.
              </Body>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(800)} style={{ alignItems: 'center' }}>
            <Whisper center>You're here. Right now, in this room.</Whisper>
            <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={finish} />
          </Animated.View>
        )}
      </View>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, dimStyle, { backgroundColor: '#000' }]} />

      {stage !== 'done' && (
        <Pressable onPress={leave} style={styles.exit}>
          <Caption color={palette.textFaint}>Not right now</Caption>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', width: '100%', paddingHorizontal: spacing.lg },
  exit: { position: 'absolute', bottom: 20, alignSelf: 'center', opacity: 0.5 },
});
