import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { SessionSoundToggle } from '@/components/SessionSoundToggle';
import { EnvironmentPicker } from '@/components/EnvironmentPicker';
import { MessageBeat } from '@/components/MessageBeat';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body, Whisper } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { EXIT_COPY } from '@/theme/exitCopy';
import { useSessionStore } from '@/store/useSessionStore';
import { useSessionAmbience } from '@/hooks/useSessionAmbience';
import { EnvironmentId } from '@/components/environments/types';

const SCRIPT = [
  { text: 'Picture somewhere you feel completely at ease.', holdMs: 4200 },
  { text: 'It can be real, or somewhere you make up right now.', holdMs: 3800 },
  { text: 'Notice the light there. Is it warm? Soft? Bright?', holdMs: 4200 },
  { text: 'Notice the ground beneath you in this place.', holdMs: 4000 },
  { text: 'Notice any sound — wind, water, quiet.', holdMs: 4000 },
  { text: 'You can stay here as long as you need.', holdMs: 4200 },
];

const OPTIONS: EnvironmentId[] = ['ocean', 'forest', 'sunset', 'clouds', 'night', 'fire'];

export default function GuidedImageryToolkit() {
  const { palette } = useTheme();
  const [stage, setStage] = useState<'pick' | 'playing' | 'done'>('pick');
  const [place, setPlace] = useState<EnvironmentId>('ocean');
  const logTechnique = useSessionStore((s) => s.logTechnique);
  useSessionAmbience(stage === 'playing', place, 0.28);

  if (stage === 'done') {
    return (
      <Screen center backdrop={<Environment id={place} warmth={0.5} />}>
        <Title center>You can come back here anytime.</Title>
        <CalmButton label={EXIT_COPY.doneForNow} variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  if (stage === 'playing') {
    return (
      <Screen center backdrop={<Environment id={place} warmth={0.15} />} overlay={<SessionSoundToggle />}>
        <MessageBeat
          beats={SCRIPT}
          onDone={() => {
            logTechnique('guided-imagery');
            setStage('done');
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen center>
      <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: spacing.md }}>
        <Whisper center>Where would you rather be right now?</Whisper>
        <Body color={palette.textMuted} center style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
          We'll take you there.
        </Body>
        <EnvironmentPicker value={place} onChange={setPlace} options={OPTIONS} />
        <CalmButton label="Begin" variant="primary" size="large" style={{ marginTop: spacing.xl, width: '100%' }} onPress={() => setStage('playing')} />
      </View>
    </Screen>
  );
}
