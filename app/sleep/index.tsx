import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { MessageBeat } from '@/components/MessageBeat';
import { BreathingOrb } from '@/components/BreathingOrb';
import { BodyScanPlayer } from '@/components/players/BodyScanPlayer';
import { PMRPlayer } from '@/components/players/PMRPlayer';
import { CognitiveShufflePlayer } from '@/components/players/CognitiveShufflePlayer';
import { CountingPlayer } from '@/components/players/CountingPlayer';
import { NothingToSolveTonight } from '@/components/players/NothingToSolveTonight';
import { SoundPicker } from '@/components/players/SoundPicker';
import { Whisper, Title } from '@/theme/Type';
import { useModeOnFocus } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';
import { BREATHING_TECHNIQUES } from '@/engines/breathing';

type WokeReason = 'racing' | 'anxious' | 'nightmare' | 'uncomfortable' | 'dontknow' | 'notasleep';
type NightStep = 'nothing-to-solve' | 'body-scan' | 'pmr' | 'breathing' | 'shuffle' | 'counting' | 'reassurance';

const OPTIONS: { id: WokeReason; label: string }[] = [
  { id: 'racing', label: 'My mind started racing' },
  { id: 'anxious', label: 'I feel anxious' },
  { id: 'nightmare', label: 'I had a nightmare' },
  { id: 'uncomfortable', label: 'I feel physically uncomfortable' },
  { id: 'dontknow', label: "I don't know" },
  { id: 'notasleep', label: "I haven't fallen asleep yet" },
];

const SEQUENCES: Record<WokeReason, NightStep[]> = {
  racing: ['nothing-to-solve', 'shuffle', 'breathing'],
  anxious: ['breathing', 'body-scan'],
  nightmare: ['reassurance', 'body-scan', 'breathing'],
  uncomfortable: ['body-scan', 'pmr'],
  dontknow: ['body-scan', 'breathing'],
  notasleep: ['shuffle', 'counting'],
};

export default function Sleep() {
  useModeOnFocus('night');
  const start = useSessionStore((s) => s.start);
  const logStep = useSessionStore((s) => s.logStep);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const endSession = useSessionStore((s) => s.end);

  const [reason, setReason] = useState<WokeReason | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      start('cant-sleep');
      started.current = true;
    }
  }, []);

  const sequence = reason ? SEQUENCES[reason] : [];

  const advance = () => {
    if (stepIndex < sequence.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      setDone(true);
    }
  };

  const chooseReason = (r: WokeReason) => {
    setReason(r);
    logStep(`sleep:${r}`);
  };

  const finish = () => {
    endSession();
    router.replace('/home');
  };

  if (!reason) {
    return (
      <Screen center>
        <View style={styles.block}>
          <Title center>What woke you up?</Title>
          <View style={{ marginTop: spacing.xl, gap: 10, width: '100%' }}>
            {OPTIONS.map((o) => (
              <CalmButton key={o.id} label={o.label} onPress={() => chooseReason(o.id)} style={{ width: '100%' }} />
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen center>
        <View style={styles.block}>
          <Whisper center>That's enough for now.</Whisper>
          <View style={{ marginTop: spacing.xl, width: '100%' }}>
            <SoundPicker />
          </View>
          <CalmButton label="I'm ready to rest" variant="primary" size="large" style={{ marginTop: spacing.xxl, width: '100%' }} onPress={finish} />
        </View>
      </Screen>
    );
  }

  const step = sequence[stepIndex];

  return (
    <Screen center>
      {step === 'nothing-to-solve' && <NothingToSolveTonight onDone={advance} />}
      {step === 'body-scan' && <BodyScanPlayer onDone={advance} />}
      {step === 'pmr' && <PMRPlayer onDone={advance} />}
      {step === 'shuffle' && <CognitiveShufflePlayer onDone={advance} />}
      {step === 'counting' && <CountingPlayer onDone={advance} />}
      {step === 'breathing' && (
        <BreathingOrb
          technique={BREATHING_TECHNIQUES.diaphragmatic}
          running
          onComplete={() => {
            logTechnique('breathing');
            advance();
          }}
        />
      )}
      {step === 'reassurance' && (
        <MessageBeat
          beats={[
            { text: 'A nightmare can feel very real, even after you wake up.', holdMs: 3800 },
            { text: 'You’re safe now. It was your mind, not this moment.', holdMs: 3800 },
          ]}
          onDone={advance}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', width: '100%', paddingHorizontal: spacing.md },
});
