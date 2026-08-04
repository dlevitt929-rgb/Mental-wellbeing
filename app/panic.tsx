import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { SessionSoundToggle } from '@/components/SessionSoundToggle';
import { MessageBeat, Beat } from '@/components/MessageBeat';
import { BreathingOrb } from '@/components/BreathingOrb';
import { GroundingSequence } from '@/components/GroundingSequence';
import { CalmButton } from '@/components/CalmButton';
import { Whisper, Body, Caption } from '@/theme/Type';
import { useTheme, useModeOnFocus } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';
import {
  CALMING_QUESTIONS,
  buildCalmingPlan,
  PlanStep,
  reassuranceLine,
  openingLineForFeeling,
} from '@/engines/calmingPath';
import { CalmingPathSignals } from '@/engines/breathing';
import { BREATHING_TECHNIQUES } from '@/engines/breathing';
import { PHYSICAL_GROUNDING_STEPS, FIVE_SENSES_SEQUENCE } from '@/data/grounding';
import { AudioManager } from '@/engines/audio/AudioManager';
import { useAudioExperience } from '@/hooks/useAudioExperience';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCalmPlanStore } from '@/store/useCalmPlanStore';
import { useLettersStore } from '@/store/useLettersStore';
import { useMemoriesStore } from '@/store/useMemoriesStore';
import { usePanicResumeStore, getFreshPanicSnapshot } from '@/store/usePanicResumeStore';
import { Feeling, BreathingPhase } from '@/types';
import { EXIT_COPY } from '@/theme/exitCopy';

type Stage = 'resume-offer' | 'opening' | 'letter-offer' | 'letter-read' | 'questions' | PlanStep['kind'] | 'landing';

// A quiet way to move on to the next technique without leaving the flow
// entirely — for whichever step in the plan is currently running.
const CAN_SWITCH_STAGES: PlanStep['kind'][] = ['breathing', 'physical-grounding', 'cognitive-distancing', 'reassurance'];

function sampleSenses(n: number) {
  const shuffled = [...FIVE_SENSES_SEQUENCE].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map((p) => p.text);
}

export default function Panic() {
  useModeOnFocus('panic');
  const { palette } = useTheme();
  const params = useLocalSearchParams<{ feeling?: string }>();
  const paramFeeling = (params.feeling as Feeling) ?? 'panicking';

  const start = useSessionStore((s) => s.start);
  const logStep = useSessionStore((s) => s.logStep);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);
  const saveResume = usePanicResumeStore((s) => s.save);
  const clearResume = usePanicResumeStore((s) => s.clear);

  const [feeling, setFeeling] = useState<Feeling>(paramFeeling);
  const [stage, setStage] = useState<Stage>('opening');
  const [resumable, setResumable] = useState(() => getFreshPanicSnapshot());
  const [qIndex, setQIndex] = useState(0);
  const [signals, setSignals] = useState<CalmingPathSignals>({});
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [planIndex, setPlanIndex] = useState(0);
  const [breathPhase, setBreathPhase] = useState<BreathingPhase['key'] | null>(null);
  const [landingReady, setLandingReady] = useState(false);

  const groundingSteps = useMemo(
    () => [...PHYSICAL_GROUNDING_STEPS.slice(0, 2), ...sampleSenses(3)],
    [],
  );

  const letters = useLettersStore((s) => s.letters);
  const markLetterOpened = useLettersStore((s) => s.markOpened);
  const memories = useMemoriesStore((s) => s.memories);
  const [chosenLetter, setChosenLetter] = useState<{ title: string; body: string } | null>(null);

  const somethingLeft = useMemo(() => {
    const availableLetters = letters.filter((l) => !l.scheduledFor || l.scheduledFor <= Date.now());
    const panicLetters = availableLetters.filter((l) => l.category === 'panic');
    const textMemories = memories.filter((m) => m.kind === 'text' && m.text);
    return { availableLetters, panicLetters, textMemories, any: availableLetters.length > 0 || textMemories.length > 0 };
  }, [letters, memories]);

  const calmPlanEntries = useCalmPlanStore((s) => s.entries);
  const calmPlanLine = useMemo(() => {
    const pool = calmPlanEntries.filter(
      (e) => e.category === 'reasons-it-will-be-okay' || e.category === 'things-to-remember',
    );
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)].text;
  }, [calmPlanEntries]);

  useEffect(() => {
    start(feeling);
    logStep('panic:opening');
    // Panic is a safety-critical entry point — it always wins over whatever
    // audio any other screen left behind, immediately.
    AudioManager.stopAll(250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The resume snapshot lives in a persisted store, which hydrates from disk
  // asynchronously — it usually isn't ready on the very first render, so the
  // initial `getFreshPanicSnapshot()` read above can miss a real snapshot.
  // Re-check once hydration actually finishes, and only act on it if the
  // person hasn't already moved past the opening beat on their own.
  useEffect(() => {
    const recheck = () => {
      const snap = getFreshPanicSnapshot();
      if (snap) {
        setResumable(snap);
        setStage((current) => (current === 'opening' ? 'resume-offer' : current));
      }
    };
    if (usePanicResumeStore.persist.hasHydrated()) {
      recheck();
      return undefined;
    }
    return usePanicResumeStore.persist.onFinishHydration(recheck);
  }, []);

  useEffect(() => {
    if (stage !== 'breathing') setBreathPhase(null);
  }, [stage]);

  useAudioExperience(stage === 'breathing', 'brown', { volume: 0.28, label: 'panic:breathing' });

  const answerQuestion = (value: boolean | undefined) => {
    const q = CALMING_QUESTIONS[qIndex];
    const resolved = q.id === 'unsafe' && value !== undefined ? !value : value;
    const next = { ...signals, [q.id]: resolved };
    setSignals(next);
    if (qIndex < CALMING_QUESTIONS.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      const builtPlan = buildCalmingPlan(next);
      setPlan(builtPlan);
      setPlanIndex(0);
      logStep('panic:plan-built');
      setStage(builtPlan[0].kind);
      saveResume({ feeling, signals: next, planIndex: 0 });
    }
  };

  const advancePlan = () => {
    const nextIndex = planIndex + 1;
    if (nextIndex >= plan.length) {
      setStage('landing');
      logStep('panic:landing');
      clearResume();
      return;
    }
    setPlanIndex(nextIndex);
    setStage(plan[nextIndex].kind);
    saveResume({ feeling, signals, planIndex: nextIndex });
  };

  const resumeSession = () => {
    if (!resumable) return;
    const rebuiltPlan = buildCalmingPlan(resumable.signals);
    const boundedIndex = Math.min(resumable.planIndex, rebuiltPlan.length - 1);
    setFeeling(resumable.feeling);
    setSignals(resumable.signals);
    setPlan(rebuiltPlan);
    setPlanIndex(boundedIndex);
    setStage(rebuiltPlan[boundedIndex].kind);
    logStep('panic:resumed');
  };

  const startFresh = () => {
    clearResume();
    setLandingReady(false);
    setStage('opening');
  };

  const warmth = useMemo(() => {
    if (stage === 'landing') return 1;
    if (plan.length === 0) return 0;
    return 0.12 + 0.55 * (planIndex / plan.length);
  }, [stage, planIndex, plan.length]);

  return (
    <Screen
      center
      backdrop={
        <Environment
          id={calmEnvironment}
          breathPhase={stage === 'breathing' ? breathPhase : null}
          warmth={warmth}
        />
      }
      overlay={
        <>
          {stage === 'breathing' && <SessionSoundToggle />}
          {CAN_SWITCH_STAGES.includes(stage as PlanStep['kind']) && (
            <Pressable onPress={advancePlan} style={styles.needDifferent} accessibilityRole="button">
              <Caption color={palette.textFaint}>{EXIT_COPY.needSomethingDifferent}</Caption>
            </Pressable>
          )}
        </>
      }
    >
      {stage === 'resume-offer' && (
        <Animated.View entering={FadeIn.duration(500)} style={styles.block}>
          <Whisper center>You were in the middle of something.</Whisper>
          <Body color={palette.textMuted} center style={{ marginTop: spacing.md }}>
            Want to pick up where you left off, or start fresh?
          </Body>
          <View style={{ marginTop: spacing.xl, gap: 10, width: '100%' }}>
            <CalmButton label="Pick up where I left off" variant="primary" size="large" style={{ width: '100%' }} onPress={resumeSession} />
            <CalmButton label="Start fresh" variant="ghost" onPress={startFresh} />
          </View>
        </Animated.View>
      )}

      {stage === 'opening' && (
        <MessageBeat
          beats={[
            { text: openingLineForFeeling(feeling), holdMs: 2800 },
            { text: 'Stay with me for the next few minutes.', holdMs: 2600 },
            { text: 'Put both feet on the floor.', requiresAction: true },
            { text: 'Good.', holdMs: 1600 },
            { text: 'Notice where your body is touching the chair or bed.', requiresAction: true },
          ]}
          onDone={() => {
            if (somethingLeft.any) {
              setStage('letter-offer');
            } else {
              logStep('panic:questions');
              setStage('questions');
            }
          }}
        />
      )}

      {stage === 'letter-offer' && (
        <View style={styles.block}>
          <Whisper center>Calm you left you something.</Whisper>
          <View style={{ marginTop: spacing.xl, gap: 10, width: '100%' }}>
            <CalmButton
              label="Read it"
              variant="primary"
              size="large"
              style={{ width: '100%' }}
              onPress={() => {
                const memoryItems = somethingLeft.textMemories.map((m) => ({
                  title: 'A calm memory',
                  body: m.text as string,
                  id: null as string | null,
                }));
                const letterPool = somethingLeft.panicLetters.length > 0 ? somethingLeft.panicLetters : somethingLeft.availableLetters;
                const letterItems = letterPool.map((l) => ({ title: l.title, body: l.body, id: l.id }));
                const pool = [...letterItems, ...memoryItems];
                const chosen = pool[Math.floor(Math.random() * pool.length)];
                if (chosen.id) markLetterOpened(chosen.id);
                setChosenLetter({ title: chosen.title, body: chosen.body });
                setStage('letter-read');
              }}
            />
            <CalmButton
              label={EXIT_COPY.notRightNow}
              variant="ghost"
              onPress={() => {
                logStep('panic:questions');
                setStage('questions');
              }}
            />
          </View>
        </View>
      )}

      {stage === 'letter-read' && chosenLetter && (
        <View style={styles.block}>
          <Caption color={palette.textFaint}>{chosenLetter.title.toUpperCase()}</Caption>
          <Whisper center style={{ marginTop: spacing.md }}>
            {chosenLetter.body}
          </Whisper>
          <CalmButton
            label="Continue"
            variant="primary"
            size="large"
            style={{ marginTop: spacing.xl, width: '100%' }}
            onPress={() => {
              logStep('panic:questions');
              setStage('questions');
            }}
          />
        </View>
      )}

      {stage === 'questions' && (
        <View style={styles.block}>
          <Whisper center>{CALMING_QUESTIONS[qIndex].text}</Whisper>
          <View style={styles.answerRow}>
            <CalmButton label="Yes" onPress={() => answerQuestion(true)} style={styles.answerBtn} />
            <CalmButton label="No" onPress={() => answerQuestion(false)} style={styles.answerBtn} />
          </View>
          <CalmButton label="Not sure" variant="ghost" onPress={() => answerQuestion(undefined)} />
        </View>
      )}

      {stage === 'safety-check' && (
        <View style={styles.block}>
          <Whisper center>If you can, move somewhere that feels even a little safer.</Whisper>
          <Body color={palette.textMuted} center style={{ marginTop: spacing.md }}>
            There's no rush. I'll be right here.
          </Body>
          <CalmButton label="I'm okay to continue" variant="primary" size="large" style={{ marginTop: spacing.xl }} onPress={advancePlan} />
        </View>
      )}

      {stage === 'breathing' && (
        <View style={styles.block}>
          <BreathingOrb
            technique={BREATHING_TECHNIQUES[plan[planIndex].breathingTechnique ?? 'extended-exhale']}
            running
            onPhase={(phase) => {
              setBreathPhase(phase.key);
              const ms = phase.seconds * 1000 * 0.8;
              if (phase.key === 'exhale' || phase.key === 'holdEmpty') {
                AudioManager.duckCurrent(0.4, ms);
              } else {
                AudioManager.unduckCurrent(ms);
              }
            }}
            onComplete={() => {
              // Every technique ends on an exhale or a hold-empty, which
              // ducks the ambient bed on the way in here — without this,
              // the next stage inherits a quietly-ducked track forever,
              // since nothing else was going to un-duck it.
              AudioManager.unduckCurrent(300);
              logTechnique('breathing');
              logStep('panic:breathing-done');
              advancePlan();
            }}
          />
        </View>
      )}

      {stage === 'physical-grounding' && (
        <GroundingSequence
          steps={groundingSteps}
          onComplete={() => {
            logTechnique('grounding');
            logStep('panic:grounding-done');
            advancePlan();
          }}
        />
      )}

      {stage === 'cognitive-distancing' && (
        <MessageBeat
          beats={[
            'Your thoughts are loud right now.',
            'They don’t need to stop for you to feel calmer.',
            { text: 'They can just be thoughts for a minute.', holdMs: 3200 },
          ]}
          onDone={() => {
            logTechnique('cognitive-defusion');
            advancePlan();
          }}
        />
      )}

      {stage === 'reassurance' && (
        <MessageBeat
          beats={[
            { text: reassuranceLine(signals), emotionalWeight: 'high' } as Beat,
            ...(calmPlanLine
              ? ([
                  { text: 'You wrote this when you were feeling okay:', holdMs: 2800 },
                  { text: `“${calmPlanLine}”`, emotionalWeight: 'high' },
                ] as Beat[])
              : ([{ text: 'You’ve gotten through moments like this before.', emotionalWeight: 'high' }] as Beat[])),
          ]}
          onDone={() => {
            logTechnique('emotional-regulation');
            advancePlan();
          }}
        />
      )}

      {stage === 'landing' && (
        <View style={styles.block}>
          <MessageBeat
            beats={[
              { text: 'You made it through the last few minutes.', emotionalWeight: 'medium' },
              { text: 'Stay here as long as you need.', emotionalWeight: 'medium' },
            ]}
            onDone={() => setLandingReady(true)}
          />
          {landingReady && (
            <Animated.View entering={FadeIn.duration(800)}>
              <CalmButton
                label="I'm ready to continue"
                variant="primary"
                style={{ marginTop: spacing.xxl }}
                onPress={() => router.replace({ pathname: '/reflection', params: { feeling } })}
              />
            </Animated.View>
          )}
        </View>
      )}

      {stage !== 'opening' && stage !== 'landing' && (
        <Animated.View entering={FadeIn.delay(600)} style={styles.footer}>
          <Pressable onPress={() => router.push('/connection')}>
            <Caption color={palette.textFaint}>I don't want to be alone</Caption>
          </Pressable>
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', width: '100%', paddingHorizontal: spacing.md },
  answerRow: { flexDirection: 'row', gap: 12, marginTop: spacing.xl, width: '100%' },
  answerBtn: { flex: 1 },
  footer: { position: 'absolute', bottom: 12, alignSelf: 'center' },
  needDifferent: { position: 'absolute', bottom: 44, alignSelf: 'center' },
});
