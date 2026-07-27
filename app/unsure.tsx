import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { CalmButton } from '@/components/CalmButton';
import { Whisper, Body } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type BodyState = 'activated' | 'heavy' | 'unsure';
type Emotion = 'sad' | 'scared' | 'angry' | 'numb';

interface Answers {
  bodyState?: BodyState;
  wantsEscape?: boolean;
  emotion?: Emotion;
  somethingHappened?: boolean;
}

const QUESTIONS = ['bodyState', 'wantsEscape', 'emotion', 'somethingHappened'] as const;

export default function Unsure() {
  const { palette } = useTheme();
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<{ line: string; ctaLabel: string; route: string } | null>(null);

  const answer = (patch: Partial<Answers>) => {
    const next = { ...answers, ...patch };
    setAnswers(next);
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      setResult(reflect(next));
    }
  };

  if (result) {
    return (
      <Screen center backdrop={<Environment id="abstract" warmth={0.5} />}>
        <Animated.View entering={FadeIn.duration(450)} style={styles.block}>
          <Whisper center>{result.line}</Whisper>
          <Body color={palette.textMuted} center style={{ marginTop: spacing.md }}>
            That's not a diagnosis — just a guess at what might help right now.
          </Body>
          <CalmButton
            label={result.ctaLabel}
            variant="primary"
            size="large"
            style={{ marginTop: spacing.xl, width: '100%' }}
            onPress={() => router.replace(result.route as any)}
          />
          <CalmButton label="Explore the toolkit instead" variant="ghost" onPress={() => router.replace('/toolkit')} />
        </Animated.View>
      </Screen>
    );
  }

  const step = QUESTIONS[qIndex];

  return (
    <Screen center backdrop={<Environment id="abstract" warmth={qIndex / QUESTIONS.length * 0.2} />}>
      <View style={styles.block}>
        {step === 'bodyState' && (
          <>
            <Whisper center>Does your body feel activated, or heavy?</Whisper>
            <View style={styles.options}>
              <CalmButton label="Activated — restless, wired" onPress={() => answer({ bodyState: 'activated' })} style={{ width: '100%' }} />
              <CalmButton label="Heavy — tired, weighed down" onPress={() => answer({ bodyState: 'heavy' })} style={{ width: '100%' }} />
              <CalmButton label="Not sure" variant="ghost" onPress={() => answer({ bodyState: 'unsure' })} />
            </View>
          </>
        )}
        {step === 'wantsEscape' && (
          <>
            <Whisper center>Do you want to escape something right now?</Whisper>
            <View style={styles.options}>
              <CalmButton label="Yes" onPress={() => answer({ wantsEscape: true })} style={{ width: '100%' }} />
              <CalmButton label="No" onPress={() => answer({ wantsEscape: false })} style={{ width: '100%' }} />
            </View>
          </>
        )}
        {step === 'emotion' && (
          <>
            <Whisper center>Do you feel more sad, scared, angry, or numb?</Whisper>
            <View style={styles.options}>
              <CalmButton label="Sad" onPress={() => answer({ emotion: 'sad' })} style={{ width: '100%' }} />
              <CalmButton label="Scared" onPress={() => answer({ emotion: 'scared' })} style={{ width: '100%' }} />
              <CalmButton label="Angry" onPress={() => answer({ emotion: 'angry' })} style={{ width: '100%' }} />
              <CalmButton label="Numb" onPress={() => answer({ emotion: 'numb' })} style={{ width: '100%' }} />
            </View>
          </>
        )}
        {step === 'somethingHappened' && (
          <>
            <Whisper center>Did something happen today?</Whisper>
            <View style={styles.options}>
              <CalmButton label="Yes" onPress={() => answer({ somethingHappened: true })} style={{ width: '100%' }} />
              <CalmButton label="No" onPress={() => answer({ somethingHappened: false })} style={{ width: '100%' }} />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

function reflect(a: Answers): { line: string; ctaLabel: string; route: string } {
  if (a.somethingHappened) {
    return {
      line: 'Something happened, and your system is still processing it.',
      ctaLabel: 'Talk it through',
      route: '/panic?feeling=something-happened',
    };
  }
  if (a.bodyState === 'activated' && (a.emotion === 'scared' || a.wantsEscape)) {
    return {
      line: 'It sounds like your nervous system might be feeling overloaded.',
      ctaLabel: 'Calm down together',
      route: '/panic?feeling=need-calm',
    };
  }
  if (a.emotion === 'angry') {
    return {
      line: 'That sounds like a lot of heat with nowhere to go yet.',
      ctaLabel: 'Try moving through it',
      route: '/toolkit/movement',
    };
  }
  if (a.bodyState === 'heavy' || a.emotion === 'numb' || a.emotion === 'sad') {
    return {
      line: 'It sounds like you might be running low, emotionally.',
      ctaLabel: 'Be gentle with yourself',
      route: '/toolkit/self-compassion',
    };
  }
  return {
    line: 'Whatever this is, it doesn’t need a name right now.',
    ctaLabel: 'Just stay with me',
    route: '/stay-with-me',
  };
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', width: '100%', paddingHorizontal: spacing.md },
  options: { marginTop: spacing.xl, gap: 10, width: '100%' },
});
