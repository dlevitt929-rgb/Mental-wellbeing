import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { MessageBeat } from '@/components/MessageBeat';
import { CalmButton } from '@/components/CalmButton';
import { Title } from '@/theme/Type';
import { spacing } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';

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

  if (done) {
    return (
      <Screen center>
        <Title center>Try saying that to yourself again sometime.</Title>
        <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen center>
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
