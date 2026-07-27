import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NothingToSolveTonight } from '@/components/players/NothingToSolveTonight';
import { CalmButton } from '@/components/CalmButton';
import { Title } from '@/theme/Type';
import { spacing } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';

export default function WorryPostponementToolkit() {
  const [done, setDone] = useState(false);
  const logTechnique = useSessionStore((s) => s.logTechnique);

  if (done) {
    return (
      <Screen center>
        <Title center>It'll keep. You don't have to.</Title>
        <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen center>
      <NothingToSolveTonight
        title="This doesn't need solving right now."
        subtitle="Write it down, and give yourself permission to think about it later — not never, just not now."
        boxLabel="LATER"
        doneLabel="Leave it for later"
        emptyLabel="Nothing right now"
        remindTomorrow={false}
        onDone={() => {
          logTechnique('worry-postponement');
          setDone(true);
        }}
      />
    </Screen>
  );
}
