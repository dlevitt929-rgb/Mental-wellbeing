import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { BreathingOrb } from '@/components/BreathingOrb';
import { CalmButton } from '@/components/CalmButton';
import { Whisper, Caption } from '@/theme/Type';
import { useModeOnFocus, useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { BREATHING_TECHNIQUES } from '@/engines/breathing';
import { useAudioExperience } from '@/hooks/useAudioExperience';
import { soundForEnvironment } from '@/engines/soundEngine';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionStore } from '@/store/useSessionStore';

const BEATS: { at: number; text: string }[] = [
  { at: 0, text: 'Put the phone down beside you.' },
  { at: 10, text: '' },
  { at: 20, text: 'Unclench your jaw.' },
  { at: 30, text: 'Let your shoulders drop.' },
  { at: 40, text: 'Notice the room around you.' },
  { at: 50, text: 'You don’t need to solve the next hour. Just this minute.' },
];

const TOTAL_SECONDS = 60;

/** The signature no-decision intervention: press it, and for sixty seconds nothing else needs choosing. */
export default function OneMinuteWithMe() {
  useModeOnFocus('panic');
  const { palette } = useTheme();
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const start = useSessionStore((s) => s.start);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const endSession = useSessionStore((s) => s.end);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const started = useRef(false);
  const lastBeatIndex = useRef(-1);

  useAudioExperience(!finished, soundForEnvironment(calmEnvironment), { volume: 0.24, label: 'one-minute' });

  useEffect(() => {
    if (!started.current) {
      start('need-calm');
      logTechnique('breathing');
      started.current = true;
    }
    const interval = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= TOTAL_SECONDS) {
          clearInterval(interval);
          setFinished(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beatIndex = [...BEATS].reverse().findIndex((b) => elapsed >= b.at);
  const currentBeat = BEATS[BEATS.length - 1 - beatIndex];

  useEffect(() => {
    const idx = BEATS.indexOf(currentBeat);
    if (idx !== lastBeatIndex.current) {
      lastBeatIndex.current = idx;
      if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [currentBeat, hapticsEnabled]);

  const warmth = Math.min(1, elapsed / TOTAL_SECONDS);
  const breathingStarted = elapsed >= 10;

  const finish = () => {
    endSession();
    router.back();
  };

  return (
    <Screen center backdrop={<Environment id={calmEnvironment} warmth={warmth} />}>
      <View style={styles.block}>
        {breathingStarted && !finished && (
          <View style={{ marginBottom: spacing.xl }}>
            <BreathingOrb technique={BREATHING_TECHNIQUES.paced} running={!finished} />
          </View>
        )}

        {!finished ? (
          currentBeat.text ? (
            <Animated.View key={currentBeat.at} entering={FadeIn.duration(700)}>
              <Whisper center>{currentBeat.text}</Whisper>
            </Animated.View>
          ) : null
        ) : (
          <Animated.View entering={FadeIn.duration(800)} style={{ alignItems: 'center' }}>
            <Whisper center>That's the minute.</Whisper>
            <CalmButton label="Stay a little longer" variant="ghost" style={{ marginTop: spacing.xl }} onPress={() => { setElapsed(50); setFinished(false); }} />
            <CalmButton label="I'm ready to go" variant="primary" style={{ marginTop: spacing.sm }} onPress={finish} />
          </Animated.View>
        )}
      </View>

      {!finished && (
        <Pressable onPress={finish} style={styles.exit}>
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
