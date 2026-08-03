import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Whisper } from '@/theme/Type';
import { useHaptics } from '@/hooks/useHaptics';
import { AudioManager } from '@/engines/audio/AudioManager';

interface Beat {
  text: string;
  holdMs?: number;
}

interface MessageBeatProps {
  beats: (string | Beat)[];
  onDone?: () => void;
  loop?: boolean;
  gapMs?: number;
  paused?: boolean;
  /** Gently lowers whatever ambient sound is playing for as long as this is on screen. Default on. */
  duckAmbience?: boolean;
}

/** Reveals one reassuring line at a time, with a real pause between each — like someone speaking slowly beside you.
 *  An empty-text beat is a deliberate silence — nothing renders, the hold still counts down. */
export function MessageBeat({ beats, onDone, loop, gapMs = 3200, paused, duckAmbience = true }: MessageBeatProps) {
  const [index, setIndex] = useState(0);
  const { breathingPulse } = useHaptics();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalized: Beat[] = beats.map((b) => (typeof b === 'string' ? { text: b } : b));

  useEffect(() => {
    if (!duckAmbience) return;
    AudioManager.duckCurrent(0.5, 400);
    return () => AudioManager.unduckCurrent(400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duckAmbience]);

  useEffect(() => {
    if (paused) return;
    if (normalized[index]?.text) breathingPulse();
    const hold = normalized[index]?.holdMs ?? gapMs;
    timer.current = setTimeout(() => {
      if (index < normalized.length - 1) {
        setIndex((i) => i + 1);
      } else if (loop) {
        setIndex(0);
      } else {
        onDone?.();
      }
    }, hold);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused]);

  return (
    <View style={styles.wrap}>
      {normalized[index]?.text ? (
        <Animated.View key={index} entering={FadeIn.duration(600)} exiting={FadeOut.duration(400)}>
          <Whisper center>{normalized[index]?.text}</Whisper>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { minHeight: 140, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
});
