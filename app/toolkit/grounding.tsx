import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { GroundingSequence } from '@/components/GroundingSequence';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { FIVE_SENSES_SEQUENCE } from '@/data/grounding';
import { useSessionStore } from '@/store/useSessionStore';

export default function GroundingToolkit() {
  const { palette } = useTheme();
  const [stage, setStage] = useState<'choose' | 'sequence' | 'done'>('choose');
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const steps = useMemo(() => [...FIVE_SENSES_SEQUENCE].sort(() => Math.random() - 0.5).slice(0, 7).map((p) => p.text), []);

  if (stage === 'done') {
    return (
      <Screen center>
        <Title center>Good. You're here now.</Title>
        <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  if (stage === 'sequence') {
    return (
      <Screen center>
        <GroundingSequence
          steps={steps}
          onComplete={() => {
            logTechnique('grounding');
            setStage('done');
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen center>
      <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: spacing.md }}>
        <Title center>Bring your attention back to the room.</Title>
        <Body color={palette.textMuted} center style={{ marginTop: spacing.sm }}>
          Either works — pick whichever feels easier right now.
        </Body>
        <View style={{ marginTop: spacing.xl, gap: 10, width: '100%' }}>
          <CalmButton label="Guide me through it" variant="primary" size="large" style={{ width: '100%' }} onPress={() => setStage('sequence')} />
          <CalmButton label="Use my camera instead" style={{ width: '100%' }} onPress={() => router.push('/camera-grounding')} />
        </View>
      </View>
    </Screen>
  );
}
