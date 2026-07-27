import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { MessageBeat } from '@/components/MessageBeat';
import { CalmButton } from '@/components/CalmButton';
import { Title } from '@/theme/Type';
import { spacing } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';

const SCRIPT = [
  { text: 'Picture somewhere you feel completely at ease.', holdMs: 4200 },
  { text: 'It can be real, or somewhere you make up right now.', holdMs: 3800 },
  { text: 'Notice the light there. Is it warm? Soft? Bright?', holdMs: 4200 },
  { text: 'Notice the ground beneath you in this place.', holdMs: 4000 },
  { text: 'Notice any sound — wind, water, quiet.', holdMs: 4000 },
  { text: 'You can stay here as long as you need.', holdMs: 4200 },
];

export default function GuidedImageryToolkit() {
  const [done, setDone] = useState(false);
  const logTechnique = useSessionStore((s) => s.logTechnique);

  if (done) {
    return (
      <Screen center>
        <Title center>You can come back here anytime.</Title>
        <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen center>
      <MessageBeat
        beats={SCRIPT}
        onDone={() => {
          logTechnique('guided-imagery');
          setDone(true);
        }}
      />
    </Screen>
  );
}
