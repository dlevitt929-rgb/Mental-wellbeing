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
import { useSessionOnMount } from '@/hooks/useSessionOnMount';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
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

const DISTRACT_BEATS = [
  { text: 'Name three sounds you can hear right now.', holdMs: 4600 },
  { text: 'Think of your favorite meal. What does it taste like?', holdMs: 4600 },
  { text: 'Picture the color of the sky today.', holdMs: 4200 },
  { text: 'Hum the first few notes of a song you like, even quietly.', holdMs: 4600 },
  { text: 'What’s a word you’ve always liked the sound of?', holdMs: 4200 },
];

const UNDERSTAND_BEATS = [
  { text: 'Your body is producing adrenaline right now. That’s the whole mechanism.', holdMs: 4800 },
  { text: 'This feeling is uncomfortable. It isn’t dangerous.', holdMs: 4200 },
  { text: 'Panic peaks, usually within minutes, and then it comes back down.', holdMs: 4600 },
  { text: 'Nothing bad is happening because your heart is beating fast.', holdMs: 4400 },
  { text: 'Your body is trying to protect you. It’s just a little overzealous right now.', holdMs: 4800 },
];

const JUST_STAY_BEATS = [
  { text: 'I’m still here.', holdMs: 20000 },
  { text: '', holdMs: 14000 },
  { text: 'Still here.', holdMs: 24000 },
  { text: '', holdMs: 14000 },
  { text: 'Not going anywhere.', holdMs: 24000 },
];

type PresenceMode = 'quiet' | 'talk-through' | 'distract' | 'understand' | 'just-stay';

const PRESENCE_MODES: { id: PresenceMode; label: string }[] = [
  { id: 'quiet', label: 'Quiet presence' },
  { id: 'talk-through', label: 'Talk me through this' },
  { id: 'distract', label: 'Distract me' },
  { id: 'understand', label: 'Help me understand' },
  { id: 'just-stay', label: 'Just stay' },
];

const BEATS_FOR_MODE: Partial<Record<PresenceMode, typeof REASSURANCE_BEATS>> = {
  quiet: REASSURANCE_BEATS,
  distract: DISTRACT_BEATS,
  understand: UNDERSTAND_BEATS,
  'just-stay': JUST_STAY_BEATS,
};

interface ChatMessage {
  from: 'me' | 'ebb';
  text: string;
}

export default function StayWithMe() {
  useModeOnFocus('panic');
  const { palette } = useTheme();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const presencePreference = useSettingsStore((s) => s.presencePreference);
  const [mode, setMode] = useState<PresenceMode>(() => {
    if (tab === 'talk') return 'talk-through';
    if (tab) return 'quiet';
    // No explicit request — fall back to what they told us during
    // onboarding they generally want in a hard moment.
    return presencePreference === 'guided' ? 'talk-through' : 'quiet';
  });
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const endSession = useSessionStore((s) => s.end);
  const [messages, setMessages] = useState<ChatMessage[]>([{ from: 'ebb', text: OPENING_LINE }]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useAudioExperience(true, 'fireplace', { volume: 0.2, label: 'stay-with-me' });
  useSessionOnMount('alone', 'stay-with-me');

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
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
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
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
    <Screen padded={mode === 'talk-through'} backdrop={<Environment id="fire" warmth={0.55} />} overlay={<SessionSoundToggle />}>
      <View style={styles.tabs}>
        {PRESENCE_MODES.map((m) => (
          <TabButton key={m.id} label={m.label} active={mode === m.id} onPress={() => setMode(m.id)} />
        ))}
      </View>

      {mode !== 'talk-through' ? (
        <View style={styles.center}>
          <MessageBeat beats={BEATS_FOR_MODE[mode] ?? REASSURANCE_BEATS} loop duckAmbience={mode !== 'just-stay'} />
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
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
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
