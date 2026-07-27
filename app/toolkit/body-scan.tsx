import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { BodyScanPlayer } from '@/components/players/BodyScanPlayer';
import { CalmButton } from '@/components/CalmButton';
import { Title } from '@/theme/Type';
import { spacing } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';

export default function BodyScanToolkit() {
  const [done, setDone] = useState(false);
  const logTechnique = useSessionStore((s) => s.logTechnique);

  if (done) {
    return (
      <Screen center>
        <Title center>Your whole body, resting.</Title>
        <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen center>
      <BodyScanPlayer
        onDone={() => {
          logTechnique('body-scan');
          setDone(true);
        }}
      />
    </Screen>
  );
}
