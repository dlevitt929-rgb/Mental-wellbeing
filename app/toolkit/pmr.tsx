import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { PMRPlayer } from '@/components/players/PMRPlayer';
import { CalmButton } from '@/components/CalmButton';
import { Title } from '@/theme/Type';
import { spacing } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';

export default function PmrToolkit() {
  const [done, setDone] = useState(false);
  const logTechnique = useSessionStore((s) => s.logTechnique);

  if (done) {
    return (
      <Screen center>
        <Title center>Let that heaviness settle.</Title>
        <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen center>
      <PMRPlayer
        onDone={() => {
          logTechnique('pmr');
          setDone(true);
        }}
      />
    </Screen>
  );
}
