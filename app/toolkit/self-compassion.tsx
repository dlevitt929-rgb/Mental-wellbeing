import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { SessionSoundToggle } from '@/components/SessionSoundToggle';
import { MessageBeat } from '@/components/MessageBeat';
import { CalmButton } from '@/components/CalmButton';
import { Title } from '@/theme/Type';
import { EXIT_COPY } from '@/theme/exitCopy';
import { spacing } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionAmbience } from '@/hooks/useSessionAmbience';

const SCRIPT = [
  { text: 'If a friend felt exactly like this, what would you say to them?', holdMs: 4400 },
  { text: 'You’d probably be kinder to them than you’re being to yourself.', holdMs: 4200 },
  { text: 'This is hard right now.', holdMs: 2600 },
  { text: 'That’s allowed.', holdMs: 2400 },
  { text: 'You’re doing the best you can with what you have right now.', holdMs: 4200 },
];

export default function SelfCompassionToolkit() {
  const [done, setDone] = useState(false);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  useSessionAmbience(!done, calmEnvironment, 0.18);

  const backdrop = <Environment id={calmEnvironment} warmth={done ? 0.6 : 0.25} />;

  if (done) {
    return (
      <Screen center backdrop={backdrop}>
        <Title center>Try saying that to yourself again sometime.</Title>
        <CalmButton label={EXIT_COPY.doneForNow} variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen center backdrop={backdrop} overlay={<SessionSoundToggle />}>
      <MessageBeat
        beats={SCRIPT}
        onDone={() => {
          logTechnique('self-compassion');
          setDone(true);
        }}
      />
    </Screen>
  );
}
