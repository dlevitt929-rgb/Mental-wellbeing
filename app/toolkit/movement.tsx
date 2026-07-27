import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { GroundingSequence } from '@/components/GroundingSequence';
import { CalmButton } from '@/components/CalmButton';
import { Title } from '@/theme/Type';
import { spacing } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';

const STEPS = [
  'Stand up, if you can.',
  'Shake out your hands, like flicking off water.',
  'Roll your shoulders back, slowly, a few times.',
  'Stretch your arms up, as high as they’ll go.',
  'Gently shake out your legs, one at a time.',
  'Let your body settle. Notice the difference.',
];

export default function MovementToolkit() {
  const [done, setDone] = useState(false);
  const logTechnique = useSessionStore((s) => s.logTechnique);

  if (done) {
    return (
      <Screen center>
        <Title center>That energy had somewhere to go.</Title>
        <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen center>
      <GroundingSequence
        steps={STEPS}
        confirmLabel="Next"
        onComplete={() => {
          logTechnique('movement');
          setDone(true);
        }}
      />
    </Screen>
  );
}
