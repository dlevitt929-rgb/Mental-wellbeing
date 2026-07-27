import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Whisper } from '@/theme/Type';
import { useSettingsStore } from '@/store/useSettingsStore';

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
}

/** Reveals one reassuring line at a time, with a real pause between each — like someone speaking slowly beside you. */
export function MessageBeat({ beats, onDone, loop, gapMs = 3200, paused }: MessageBeatProps) {
  const [index, setIndex] = useState(0);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalized: Beat[] = beats.map((b) => (typeof b === 'string' ? { text: b } : b));

  useEffect(() => {
    if (paused) return;
    if (hapticsEnabled) Haptics.selectionAsync().catch(() => {});
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
      <Animated.View key={index} entering={FadeIn.duration(600)} exiting={FadeOut.duration(400)}>
        <Whisper center>{normalized[index]?.text}</Whisper>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { minHeight: 140, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
});
