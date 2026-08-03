import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { SessionSoundToggle } from '@/components/SessionSoundToggle';
import { BreathingOrb } from '@/components/BreathingOrb';
import { GroundingSequence } from '@/components/GroundingSequence';
import { MessageBeat } from '@/components/MessageBeat';
import { CalmButton } from '@/components/CalmButton';
import { Whisper, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { BREATHING_TECHNIQUES } from '@/engines/breathing';
import { FIVE_SENSES_SEQUENCE } from '@/data/grounding';
import { useSessionAmbience } from '@/hooks/useSessionAmbience';
import { useSessionOnMount } from '@/hooks/useSessionOnMount';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionStore } from '@/store/useSessionStore';
import { EXIT_COPY } from '@/theme/exitCopy';

const SENSORY_STEPS = [
  'Hold something cold, or run your wrists under the tap.',
  'Notice a texture near you. Trace it slowly with your fingers.',
  'Press your palms together, firmly, for a few seconds.',
];

const REASSURANCE: string[] = [
  'You didn’t have to choose any of that. It happened anyway.',
  'Nothing about this needed to be figured out.',
  'You’re allowed to just be led for a while.',
  'That’s the whole thing. There’s nothing after this you have to do.',
];

type Stage = 'breathing' | 'grounding' | 'sensory' | 'reassurance' | 'quiet' | 'done';
const ORDER: Stage[] = ['breathing', 'grounding', 'sensory', 'reassurance', 'quiet', 'done'];
const WARMTH_FOR_STAGE: Record<Stage, number> = {
  breathing: 0.15,
  grounding: 0.3,
  sensory: 0.45,
  reassurance: 0.65,
  quiet: 0.85,
  done: 1,
};

/** Zero-decision chain: breathing → grounding → sensory → reassurance → quiet.
 *  Everything advances on its own. The only choice offered anywhere is to leave. */
export default function DontThinkJustFollow() {
  const { palette } = useTheme();
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const endSession = useSessionStore((s) => s.end);
  const [stage, setStage] = useState<Stage>('breathing');
  const groundingSteps = useMemo(
    () => [...FIVE_SENSES_SEQUENCE].sort(() => Math.random() - 0.5).slice(0, 4).map((p) => p.text),
    [],
  );

  useSessionOnMount('overwhelmed');
  useSessionAmbience(stage !== 'done', calmEnvironment, 0.22);

  const advance = () => {
    const idx = ORDER.indexOf(stage);
    setStage(ORDER[idx + 1] ?? 'done');
  };

  const leave = () => {
    endSession();
    router.back();
  };

  const finish = () => {
    endSession();
    router.back();
  };

  return (
    <Screen
      center
      backdrop={<Environment id={calmEnvironment} warmth={WARMTH_FOR_STAGE[stage]} />}
      overlay={stage !== 'done' ? <SessionSoundToggle /> : undefined}
    >
      <View style={styles.block}>
        {stage === 'breathing' && (
          <BreathingOrb
            technique={BREATHING_TECHNIQUES.paced}
            running
            onComplete={() => {
              logTechnique('breathing');
              advance();
            }}
          />
        )}

        {stage === 'grounding' && (
          <GroundingSequence
            steps={groundingSteps}
            onComplete={() => {
              logTechnique('grounding');
              advance();
            }}
          />
        )}

        {stage === 'sensory' && (
          <GroundingSequence
            steps={SENSORY_STEPS}
            confirmLabel="Done that"
            onComplete={() => {
              logTechnique('sensory-grounding');
              advance();
            }}
          />
        )}

        {stage === 'reassurance' && (
          <MessageBeat beats={REASSURANCE} gapMs={3400} onDone={advance} />
        )}

        {stage === 'quiet' && (
          <Animated.View entering={FadeIn.duration(1200)} style={{ alignItems: 'center' }}>
            <Whisper center>Nothing else to do right now.</Whisper>
            <CalmButton
              label="I'm ready to go"
              variant="ghost"
              style={{ marginTop: spacing.xl }}
              onPress={() => {
                logTechnique('follow-along');
                setStage('done');
              }}
            />
          </Animated.View>
        )}

        {stage === 'done' && (
          <Animated.View entering={FadeIn.duration(800)} style={{ alignItems: 'center' }}>
            <Whisper center>That's the whole thing.</Whisper>
            <CalmButton label={EXIT_COPY.doneForNow} variant="primary" style={{ marginTop: spacing.xl }} onPress={finish} />
          </Animated.View>
        )}
      </View>

      {stage !== 'done' && stage !== 'quiet' && (
        <Pressable onPress={leave} style={styles.exit}>
          <Caption color={palette.textFaint}>I need something different</Caption>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', width: '100%', paddingHorizontal: spacing.lg },
  exit: { position: 'absolute', bottom: 20, alignSelf: 'center', opacity: 0.5 },
});
