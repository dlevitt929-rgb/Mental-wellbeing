import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { SessionSoundToggle } from '@/components/SessionSoundToggle';
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
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAudioExperience } from '@/hooks/useAudioExperience';
import { soundForEnvironment } from '@/engines/soundEngine';
import { BREATHING_TECHNIQUES } from '@/engines/breathing';
import { BreathingPhase } from '@/types';

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
  const sleepEnvironment = useSettingsStore((s) => s.sleepEnvironment);

  const [reason, setReason] = useState<WokeReason | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [breathPhase, setBreathPhase] = useState<BreathingPhase['key'] | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      start('cant-sleep');
      started.current = true;
    }
  }, []);

  // Ambient bed plays for the guided part of the session only; the "done" screen
  // hands full control to SoundPicker so the person can choose what to fall asleep to.
  useAudioExperience(Boolean(reason) && !done, reason ? soundForEnvironment(sleepEnvironment) : null, {
    volume: 0.24,
    label: 'sleep:guided',
  });

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

  const backdrop = <Environment id={sleepEnvironment} breathPhase={breathPhase} warmth={done ? 0.2 : 0} />;

  if (!reason) {
    return (
      <Screen center backdrop={backdrop}>
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
      <Screen center backdrop={backdrop}>
        <View style={styles.block}>
          <Whisper center>That's enough for now.</Whisper>
          <View style={{ marginTop: spacing.xl, width: '100%' }}>
            <SoundPicker />
          </View>
          <CalmButton
            label="Write about it"
            variant="ghost"
            style={{ marginTop: spacing.lg, width: '100%' }}
            onPress={() => router.push('/journal/new')}
          />
          <CalmButton label="I'm ready to rest" variant="primary" size="large" style={{ marginTop: spacing.sm, width: '100%' }} onPress={finish} />
        </View>
      </Screen>
    );
  }

  const step = sequence[stepIndex];

  return (
    <Screen center backdrop={backdrop} overlay={<SessionSoundToggle />}>
      {step === 'nothing-to-solve' && <NothingToSolveTonight onDone={advance} />}
      {step === 'body-scan' && <BodyScanPlayer onDone={advance} />}
      {step === 'pmr' && <PMRPlayer onDone={advance} />}
      {step === 'shuffle' && <CognitiveShufflePlayer onDone={advance} />}
      {step === 'counting' && <CountingPlayer onDone={advance} />}
      {step === 'breathing' && (
        <BreathingOrb
          technique={BREATHING_TECHNIQUES.diaphragmatic}
          running
          onPhase={(phase) => setBreathPhase(phase.key)}
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
