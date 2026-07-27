import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { GroundingSequence } from '@/components/GroundingSequence';
import { CalmButton } from '@/components/CalmButton';
import { Title } from '@/theme/Type';
import { spacing } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';

const STEPS = [
  'Hold something cold — a glass of water, or run your wrists under the tap.',
  'Notice a texture near you. Trace it slowly with your fingers.',
  'Notice any taste in your mouth, or take a sip of something.',
  'Press your palms together, firmly, for a few seconds.',
  'Notice the temperature of the air on your face.',
];

export default function SensoryToolkit() {
  const [done, setDone] = useState(false);
  const logTechnique = useSessionStore((s) => s.logTechnique);

  if (done) {
    return (
      <Screen center>
        <Title center>Back in your body.</Title>
        <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen center>
      <GroundingSequence
        steps={STEPS}
        confirmLabel="Done that"
        onComplete={() => {
          logTechnique('sensory-grounding');
          setDone(true);
        }}
      />
    </Screen>
  );
}
