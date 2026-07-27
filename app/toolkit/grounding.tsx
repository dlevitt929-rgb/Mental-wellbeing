import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { GroundingSequence } from '@/components/GroundingSequence';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { FIVE_SENSES_SEQUENCE } from '@/data/grounding';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function GroundingToolkit() {
  const { palette } = useTheme();
  const [stage, setStage] = useState<'choose' | 'sequence' | 'done'>('choose');
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  const steps = useMemo(() => [...FIVE_SENSES_SEQUENCE].sort(() => Math.random() - 0.5).slice(0, 7).map((p) => p.text), []);

  // No ambient sound here on purpose — grounding asks you to notice the real
  // sounds around you, and synthetic audio would work against that.
  const backdrop = <Environment id={calmEnvironment} warmth={stage === 'done' ? 0.4 : 0} />;

  if (stage === 'done') {
    return (
      <Screen center backdrop={backdrop}>
        <Title center>Good. You're here now.</Title>
        <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
      </Screen>
    );
  }

  if (stage === 'sequence') {
    return (
      <Screen center backdrop={backdrop}>
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
    <Screen center backdrop={backdrop}>
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
