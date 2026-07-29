import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { SessionSoundToggle } from '@/components/SessionSoundToggle';
import { MessageBeat } from '@/components/MessageBeat';
import { CalmButton } from '@/components/CalmButton';
import { Body, Caption } from '@/theme/Type';
import { useTheme, useModeOnFocus } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useAudioExperience } from '@/hooks/useAudioExperience';
import { useSessionStore } from '@/store/useSessionStore';
import { companionRespond, OPENING_LINE } from '@/engines/aiCompanion';
import { fonts } from '@/theme/useAppFonts';

const REASSURANCE_BEATS = [
  { text: 'You don’t need to do anything.', holdMs: 3400 },
  { text: 'Just stay here.', holdMs: 3200 },
  { text: 'Let your shoulders drop.', holdMs: 3400 },
  { text: 'You’re allowed to feel whatever you’re feeling.', holdMs: 3800 },
  { text: 'We’ll take this one minute at a time.', holdMs: 3800 },
  { text: 'I’m not going anywhere.', holdMs: 3400 },
];

interface ChatMessage {
  from: 'me' | 'ebb';
  text: string;
}

export default function StayWithMe() {
  useModeOnFocus('panic');
  const { palette } = useTheme();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [mode, setMode] = useState<'quiet' | 'talk'>(tab === 'talk' ? 'talk' : 'quiet');
  const start = useSessionStore((s) => s.start);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const endSession = useSessionStore((s) => s.end);
  const [messages, setMessages] = useState<ChatMessage[]>([{ from: 'ebb', text: OPENING_LINE }]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const started = useRef(false);

  useAudioExperience(true, 'fireplace', { volume: 0.2, label: 'stay-with-me' });

  useEffect(() => {
    if (!started.current) {
      start('alone');
      logTechnique('stay-with-me');
      started.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((m) => [...m, { from: 'me', text }]);
    const reply = companionRespond(text);
    if (reply.safety !== 'none') {
      router.push({ pathname: '/crisis', params: { level: reply.safety } });
      return;
    }
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'ebb', text: reply.text }]);
      logTechnique('talking');
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }, 500);
  };

  const finish = () => {
    endSession();
    router.replace('/reflection');
  };

  return (
    <Screen padded={mode === 'talk'} backdrop={<Environment id="fire" warmth={0.55} />} overlay={<SessionSoundToggle />}>
      <View style={styles.tabs}>
        <TabButton label="Stay quiet" active={mode === 'quiet'} onPress={() => setMode('quiet')} />
        <TabButton label="Talk" active={mode === 'talk'} onPress={() => setMode('talk')} />
      </View>

      {mode === 'quiet' ? (
        <View style={styles.center}>
          <MessageBeat beats={REASSURANCE_BEATS} loop />
          <CalmButton label="I feel a little better" variant="primary" onPress={finish} style={{ marginTop: spacing.xxl }} />
        </View>
      ) : (
        <View style={styles.chatWrap}>
          <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: spacing.md, gap: 10 }}>
            {messages.map((m, i) => (
              <Animated.View
                key={i}
                entering={FadeIn.duration(300)}
                style={[
                  styles.bubble,
                  m.from === 'me'
                    ? { alignSelf: 'flex-end', backgroundColor: palette.accent }
                    : { alignSelf: 'flex-start', backgroundColor: palette.surfaceRaised, borderWidth: 1, borderColor: palette.border },
                ]}
              >
                <Body color={m.from === 'me' ? '#1A1410' : palette.text}>{m.text}</Body>
              </Animated.View>
            ))}
          </ScrollView>
          <View style={[styles.inputRow, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="What's going on?"
              placeholderTextColor={palette.textFaint}
              style={[styles.input, { color: palette.text, fontFamily: fonts.body }]}
              onSubmitEditing={send}
              returnKeyType="send"
              multiline
            />
            <Pressable onPress={send}>
              <Caption color={palette.accent}>Send</Caption>
            </Pressable>
          </View>
          <CalmButton label="I feel a little better" onPress={finish} style={{ marginTop: spacing.md }} />
        </View>
      )}
    </Screen>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && { backgroundColor: palette.surfaceRaised, borderColor: palette.border, borderWidth: 1 }]}>
      <Caption color={active ? palette.text : palette.textFaint}>{label}</Caption>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  tab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: radii.round },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chatWrap: { flex: 1 },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: radii.md },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: { flex: 1, fontSize: 16, maxHeight: 100 },
});
