import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AnxietyShape } from '@/components/AnxietyShape';
import { BreathingOrb } from '@/components/BreathingOrb';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body, Whisper, Display } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { EXIT_COPY } from '@/theme/exitCopy';
import { BREATHING_TECHNIQUES } from '@/engines/breathing';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionAmbience } from '@/hooks/useSessionAmbience';

type Stage = 'set' | 'breathing' | 'compare';

export default function EmotionalRegulationToolkit() {
  const { palette } = useTheme();
  const [stage, setStage] = useState<Stage>('set');
  const [intensity, setIntensity] = useState(0.7);
  const [startIntensity, setStartIntensity] = useState(0.7);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  useSessionAmbience(stage === 'breathing', calmEnvironment, 0.22);
  const technique = BREATHING_TECHNIQUES['extended-exhale'];

  if (stage === 'compare') {
    return (
      <Screen center>
        <View style={styles.block}>
          <Whisper center>How big does it feel now?</Whisper>
          <View style={{ marginTop: spacing.xl }}>
            <AnxietyShape intensity={intensity} />
          </View>
          <Body color={palette.textMuted} center style={{ marginTop: spacing.xl }}>
            It started at {Math.round(startIntensity * 100)}%. Feelings peak, and then they fall — even without you doing anything else.
          </Body>
          <CalmButton label={EXIT_COPY.doneForNow} variant="primary" size="large" style={{ marginTop: spacing.xl, width: '100%' }} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  if (stage === 'breathing') {
    return (
      <Screen center>
        <View style={{ transform: [{ scale: 0.55 }], marginBottom: -40 }}>
          <AnxietyShape intensity={intensity} animateSettle />
        </View>
        <BreathingOrb
          technique={technique}
          running
          onCycleComplete={(cycleIndex) => {
            const remaining = technique.cycles - cycleIndex - 1;
            const target = 0.15 + (startIntensity - 0.15) * (remaining / technique.cycles);
            setIntensity(target);
          }}
          onComplete={() => {
            logTechnique('emotional-regulation');
            setIntensity(0.12);
            setStage('compare');
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen center>
      <View style={styles.block}>
        <Whisper center>If this feeling were a shape, how big would it be?</Whisper>
        <View style={{ marginTop: spacing.xl }}>
          <AnxietyShape intensity={intensity} />
        </View>
        <View style={styles.sizeRow}>
          <Pressable
            onPress={() => setIntensity((v) => Math.max(0.2, +(v - 0.1).toFixed(2)))}
            style={[styles.sizeBtn, { borderColor: palette.border }]}
          >
            <Title>–</Title>
          </Pressable>
          <Display style={{ minWidth: 70, textAlign: 'center' }}>{Math.round(intensity * 100)}%</Display>
          <Pressable
            onPress={() => setIntensity((v) => Math.min(1, +(v + 0.1).toFixed(2)))}
            style={[styles.sizeBtn, { borderColor: palette.border }]}
          >
            <Title>+</Title>
          </Pressable>
        </View>
        <CalmButton
          label="Breathe it down"
          variant="primary"
          size="large"
          style={{ marginTop: spacing.xl, width: '100%' }}
          onPress={() => {
            setStartIntensity(intensity);
            setStage('breathing');
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { width: '100%', alignItems: 'center', paddingHorizontal: spacing.md },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.xl },
  sizeBtn: { width: 48, height: 48, borderRadius: radii.round, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
