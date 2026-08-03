import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { SessionSoundToggle } from '@/components/SessionSoundToggle';
import { BodyScanPlayer } from '@/components/players/BodyScanPlayer';
import { CalmButton } from '@/components/CalmButton';
import { Title } from '@/theme/Type';
import { EXIT_COPY } from '@/theme/exitCopy';
import { spacing } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionAmbience } from '@/hooks/useSessionAmbience';

export default function BodyScanToolkit() {
  const [done, setDone] = useState(false);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  useSessionAmbience(!done, calmEnvironment, 0.2);

  const backdrop = <Environment id={calmEnvironment} warmth={done ? 0.4 : 0.1} />;

  if (done) {
    return (
      <Screen center backdrop={backdrop}>
        <Title center>Your whole body, resting.</Title>
        <CalmButton label={EXIT_COPY.doneForNow} variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen center backdrop={backdrop} overlay={<SessionSoundToggle />}>
      <BodyScanPlayer
        onDone={() => {
          logTechnique('body-scan');
          setDone(true);
        }}
      />
    </Screen>
  );
}
