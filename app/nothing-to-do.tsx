import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { SessionSoundToggle } from '@/components/SessionSoundToggle';
import { MessageBeat } from '@/components/MessageBeat';
import { Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { useSessionAmbience } from '@/hooks/useSessionAmbience';
import { useSessionOnMount } from '@/hooks/useSessionOnMount';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionStore } from '@/store/useSessionStore';

const LINES: { text: string; holdMs: number }[] = [
  { text: 'Nothing to do here. Just be.', holdMs: 30000 },
  { text: '', holdMs: 15000 },
  { text: 'Still nothing to do.', holdMs: 45000 },
  { text: '', holdMs: 20000 },
  { text: 'You can stay as long as you want.', holdMs: 45000 },
];

/** No timer, no count, no completion state — the anti-feature. It exists so
 *  there's somewhere to just sit without anything being asked of you. */
export default function NothingToDo() {
  const { palette } = useTheme();
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  const endSession = useSessionStore((s) => s.end);
  const [warmth, setWarmth] = useState(0);

  useSessionOnMount('need-calm', 'stillness');
  useSessionAmbience(true, calmEnvironment, 0.2);

  useEffect(() => {
    const interval = setInterval(() => setWarmth((w) => Math.min(1, w + 0.15)), 45000);
    return () => clearInterval(interval);
  }, []);

  const leave = () => {
    endSession();
    router.back();
  };

  return (
    <Screen center backdrop={<Environment id={calmEnvironment} warmth={warmth} />} overlay={<SessionSoundToggle />}>
      <View style={styles.block}>
        <MessageBeat beats={LINES} loop duckAmbience={false} />
      </View>

      <Pressable onPress={leave} style={styles.exit}>
        <Caption color={palette.textFaint}>I'm ready to go</Caption>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', width: '100%' },
  exit: { position: 'absolute', bottom: 20, alignSelf: 'center', opacity: 0.5 },
});
