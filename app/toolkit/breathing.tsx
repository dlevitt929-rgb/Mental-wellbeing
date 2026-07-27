import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { BreathingOrb } from '@/components/BreathingOrb';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { BREATHING_TECHNIQUES } from '@/engines/breathing';
import { BreathingTechniqueId } from '@/types';
import { useSessionStore } from '@/store/useSessionStore';

const ORDER: BreathingTechniqueId[] = ['paced', 'extended-exhale', 'box', 'diaphragmatic', 'physiological-sigh'];

export default function BreathingToolkit() {
  const { palette } = useTheme();
  const [techniqueId, setTechniqueId] = useState<BreathingTechniqueId>('paced');
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const logTechnique = useSessionStore((s) => s.logTechnique);

  if (complete) {
    return (
      <Screen center>
        <Title center>Nice.</Title>
        <CalmButton label="Done" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
        <CalmButton label="One more round" variant="ghost" onPress={() => { setComplete(false); setRunning(true); }} />
      </Screen>
    );
  }

  if (running) {
    return (
      <Screen center>
        <BreathingOrb
          technique={BREATHING_TECHNIQUES[techniqueId]}
          running
          onComplete={() => {
            logTechnique('breathing');
            setComplete(true);
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen center>
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
