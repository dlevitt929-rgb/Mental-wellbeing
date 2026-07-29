import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { SessionSoundToggle } from '@/components/SessionSoundToggle';
import { BreathingOrb } from '@/components/BreathingOrb';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { BREATHING_TECHNIQUES } from '@/engines/breathing';
import { BreathingTechniqueId, BreathingPhase } from '@/types';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionAmbience } from '@/hooks/useSessionAmbience';

const ORDER: BreathingTechniqueId[] = ['paced', 'extended-exhale', 'box', 'diaphragmatic', 'physiological-sigh'];

export default function BreathingToolkit() {
  const { palette } = useTheme();
  const [techniqueId, setTechniqueId] = useState<BreathingTechniqueId>('paced');
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [breathPhase, setBreathPhase] = useState<BreathingPhase['key'] | null>(null);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  useSessionAmbience(running, calmEnvironment, 0.26);

  const backdrop = <Environment id={calmEnvironment} breathPhase={running ? breathPhase : null} warmth={complete ? 0.5 : 0} />;

  if (complete) {
    return (
      <Screen center backdrop={backdrop}>
        <Title center>Nice.</Title>
        <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
        <CalmButton label="One more round" variant="ghost" onPress={() => { setComplete(false); setRunning(true); }} />
      </Screen>
    );
  }

  if (running) {
    return (
      <Screen center backdrop={backdrop} overlay={<SessionSoundToggle />}>
        <BreathingOrb
          technique={BREATHING_TECHNIQUES[techniqueId]}
          running
          onPhase={(phase) => setBreathPhase(phase.key)}
          onComplete={() => {
            logTechnique('breathing');
            setComplete(true);
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen center backdrop={backdrop}>
      <View style={styles.block}>
        <Title center>Choose a rhythm</Title>
        <Body color={palette.textMuted} center style={{ marginTop: spacing.sm }}>
          Any of these work. Pick whatever sounds easiest right now.
        </Body>
        <View style={{ marginTop: spacing.xl, gap: 10, width: '100%' }}>
          {ORDER.map((id) => {
            const t = BREATHING_TECHNIQUES[id];
            const active = techniqueId === id;
            return (
              <Pressable
                key={id}
                onPress={() => setTechniqueId(id)}
                style={[
                  styles.option,
                  { borderColor: active ? palette.accent : palette.border, backgroundColor: active ? palette.surfaceRaised : palette.surface },
                ]}
              >
                <Body>{t.name}</Body>
                <Caption color={palette.textMuted} style={{ marginTop: 2 }}>
                  {t.description}
                </Caption>
              </Pressable>
            );
          })}
        </View>
        <CalmButton label="Begin" variant="primary" size="large" style={{ marginTop: spacing.xl, width: '100%' }} onPress={() => setRunning(true)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { width: '100%', alignItems: 'center', paddingHorizontal: spacing.md },
  option: { width: '100%', padding: spacing.md, borderRadius: radii.md, borderWidth: 1 },
});
