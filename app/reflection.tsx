import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { CalmButton } from '@/components/CalmButton';
import { Whisper, Body, Caption } from '@/theme/Type';
import { useTheme, useModeOnFocus } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { fonts } from '@/theme/useAppFonts';
import { useSessionStore } from '@/store/useSessionStore';
import { useMemoriesStore } from '@/store/useMemoriesStore';
import { Session, Technique } from '@/types';

const HELPED_OPTIONS: { label: string; value: Session['helped'] }[] = [
  { label: 'Much better', value: 'much-better' },
  { label: 'A little better', value: 'a-little-better' },
  { label: 'About the same', value: 'about-the-same' },
  { label: 'Worse', value: 'worse' },
];

const WHAT_HELPED: { label: string; value: Technique | 'time' }[] = [
  { label: 'Breathing', value: 'breathing' },
  { label: 'Grounding', value: 'grounding' },
  { label: 'Talking', value: 'talking' },
  { label: 'Just time', value: 'time' },
  { label: 'Movement', value: 'movement' },
];

export default function Reflection() {
  useModeOnFocus('reflect');
  const { palette } = useTheme();
  const { feeling } = useLocalSearchParams<{ feeling?: string }>();
  const endSession = useSessionStore((s) => s.end);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  // Empty My Head already offers to save thoughts as a journal entry, so we
  // don't double up on the invitation here.
  const offerJournal = feeling !== 'racing-thoughts';

  const [helped, setHelped] = useState<Session['helped'] | null>(null);
  const [whatHelped, setWhatHelped] = useState<string | null>(null);
  const [madeItOpen, setMadeItOpen] = useState(false);
  const [madeItText, setMadeItText] = useState('');
  const [madeItSaved, setMadeItSaved] = useState(false);
  const addMemory = useMemoriesStore((s) => s.addText);
  const wentWell = helped === 'much-better' || helped === 'a-little-better';

  const saveMadeIt = () => {
    const trimmed = madeItText.trim();
    if (!trimmed) return;
    addMemory(trimmed, 'made-it-through');
    setMadeItSaved(true);
  };

  const finish = (h: Session['helped'], w?: string) => {
    if (w && w !== 'time') logTechnique(w as Technique);
    endSession({ helped: h });
  };

  if (!helped) {
    return (
      <Screen center backdrop={<Environment id="sunset" warmth={0.35} />}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.block}>
          <Whisper center>Are you feeling even slightly better?</Whisper>
          <View style={styles.options}>
            {HELPED_OPTIONS.map((o) => (
              <CalmButton key={o.value} label={o.label} onPress={() => setHelped(o.value)} style={{ width: '100%' }} />
            ))}
          </View>
        </Animated.View>
      </Screen>
    );
  }

  if (!whatHelped) {
    return (
      <Screen center backdrop={<Environment id="sunset" warmth={0.55} />}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.block}>
          <Whisper center>What helped most?</Whisper>
          <View style={styles.options}>
            {WHAT_HELPED.map((o) => (
              <CalmButton
                key={o.value}
                label={o.label}
                onPress={() => {
                  setWhatHelped(o.value);
                  finish(helped, o.value);
                }}
                style={{ width: '100%' }}
              />
            ))}
            <CalmButton
              label="Skip"
              variant="ghost"
              onPress={() => {
                setWhatHelped('skipped');
                finish(helped);
              }}
            />
          </View>
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen center backdrop={<Environment id="sunset" warmth={0.85} />}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.block}>
        <Whisper center>{closingLine(helped)}</Whisper>

        {wentWell && !madeItOpen && !madeItSaved && (
          <CalmButton
            label="What would you want to remember about getting through this?"
            variant="ghost"
            style={{ marginTop: spacing.lg, width: '100%' }}
            onPress={() => setMadeItOpen(true)}
          />
        )}

        {wentWell && madeItOpen && !madeItSaved && (
          <View style={[styles.madeItBox, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <TextInput
              value={madeItText}
              onChangeText={setMadeItText}
              placeholder="I made it through by..."
              placeholderTextColor={palette.textFaint}
              style={[styles.madeItInput, { color: palette.text, fontFamily: fonts.body }]}
              multiline
              autoFocus
            />
            <CalmButton label="Save this" variant="primary" onPress={saveMadeIt} style={{ marginTop: spacing.sm, width: '100%' }} />
          </View>
        )}

        {wentWell && madeItSaved && (
          <Caption color={palette.textMuted} style={{ marginTop: spacing.md }}>
            Saved. It'll be there for you later.
          </Caption>
        )}

        <View style={styles.options}>
          <CalmButton label="Done" variant="primary" size="large" onPress={() => router.replace('/home')} style={{ width: '100%' }} />
          {offerJournal && (
            <CalmButton
              label="Want to write down what's on your mind?"
              variant="ghost"
              onPress={() => router.replace('/journal/new')}
              style={{ width: '100%' }}
            />
          )}
          {helped === 'worse' || helped === 'about-the-same' ? (
            <>
              <CalmButton label="Try something else" onPress={() => router.replace('/toolkit')} style={{ width: '100%' }} />
              <CalmButton label="I don't want to be alone" onPress={() => router.replace('/connection')} style={{ width: '100%' }} />
            </>
          ) : null}
        </View>
      </Animated.View>
    </Screen>
  );
}

function closingLine(helped: Session['helped']) {
  switch (helped) {
    case 'much-better':
      return 'Good. You got through it.';
    case 'a-little-better':
      return 'That’s a real step. It doesn’t have to be all at once.';
    case 'about-the-same':
      return 'That’s okay. Some moments take longer than a few minutes.';
    default:
      return 'That’s alright. You don’t have to do this alone.';
  }
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', width: '100%', paddingHorizontal: spacing.md },
  options: { marginTop: spacing.xl, gap: 10, width: '100%' },
  madeItBox: { marginTop: spacing.lg, width: '100%', padding: spacing.md, borderRadius: radii.md, borderWidth: 1 },
  madeItInput: { fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
});
