import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  createAudioPlayer,
} from 'expo-audio';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body, Headline, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { fonts } from '@/theme/useAppFonts';
import { useMemoriesStore } from '@/store/useMemoriesStore';
import { AudioManager } from '@/engines/audio/AudioManager';
import { EmptyState } from '@/components/EmptyState';

type Mode = 'list' | 'write' | 'record';

export default function Memories() {
  const { palette } = useTheme();
  const params = useLocalSearchParams<{ mode?: Mode }>();
  const memories = useMemoriesStore((s) => s.memories);
  const addText = useMemoriesStore((s) => s.addText);
  const remove = useMemoriesStore((s) => s.remove);
  // A long-press shortcut ("Record a voice note") can land here already
  // pointed at record mode instead of making someone tap through the list first.
  const [mode, setMode] = useState<Mode>(params.mode === 'record' ? 'record' : 'list');
  const [text, setText] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const activePlayback = useRef<{ player: ReturnType<typeof createAudioPlayer>; sub: { remove: () => void } } | null>(null);

  // Every previous voice-memo player used to leak (created, played, never
  // released) and tapping a second one — or the same one twice — layered a
  // new player on top instead of replacing it, so two memories could play
  // at once. Now there's ever only one, tracked and torn down explicitly.
  const stopPlayback = () => {
    if (activePlayback.current) {
      activePlayback.current.sub.remove();
      activePlayback.current.player.pause();
      activePlayback.current.player.release();
      activePlayback.current = null;
    }
    AudioManager.unduckCurrent(300);
    setPlayingId(null);
  };

  const togglePlayback = (id: string, uri: string) => {
    if (playingId === id) {
      stopPlayback();
      return;
    }
    stopPlayback();
    AudioManager.duckCurrent(0.6, 200);
    const player = createAudioPlayer(uri);
    const sub = player.addListener('playbackStatusUpdate', (status) => {
      // Un-duck and release exactly when the clip actually ends, instead of
      // guessing a fixed delay that cuts off longer memories mid-playback.
      if (status.didJustFinish) stopPlayback();
    });
    activePlayback.current = { player, sub };
    setPlayingId(id);
    player.play();
  };

  useEffect(() => stopPlayback, []);

  const saveText = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addText(trimmed);
    setText('');
    setMode('list');
  };

  return (
    <Screen scroll>
      <Title style={{ marginTop: spacing.lg }}>Calm memories</Title>
      <Body color={palette.textMuted} style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
        Save something that reminds you things can feel okay — a memory, a reassurance, your own
        voice. It'll be here on the harder days.
      </Body>

      {mode === 'list' && (
        <>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.lg }}>
            <CalmButton label="Write one" onPress={() => setMode('write')} style={{ flex: 1 }} />
            <CalmButton label="Record your voice" onPress={() => setMode('record')} style={{ flex: 1 }} />
          </View>

          <View style={{ gap: 10 }}>
            {memories.length === 0 && (
              <EmptyState
                glyph="✦"
                message="Save something from a better moment for a harder one."
                actionLabel="Add a memory"
                onAction={() => setMode('write')}
              />
            )}
            {memories.map((m) => (
              <Animated.View
                key={m.id}
                entering={FadeInDown.duration(300)}
                layout={LinearTransition}
                style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
              >
                {m.kind === 'text' ? (
                  <Body color={palette.textMuted} style={{ flex: 1 }}>
                    {m.text}
                  </Body>
                ) : (
                  <Pressable
                    onPress={() => togglePlayback(m.id, m.audioUri!)}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  >
                    <Caption color={palette.accent}>{playingId === m.id ? '■' : '▶'}</Caption>
                    <Body color={palette.textMuted}>{playingId === m.id ? 'Playing…' : 'A voice memory'}</Body>
                  </Pressable>
                )}
                <Pressable onPress={() => { if (playingId === m.id) stopPlayback(); remove(m.id); }}>
                  <Caption color={palette.danger}>Remove</Caption>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </>
      )}

      {mode === 'write' && (
        <View style={[styles.form, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="A time things got better. Something someone said. Anything that helps."
            placeholderTextColor={palette.textFaint}
            style={[styles.bodyInput, { color: palette.text, fontFamily: fonts.body }]}
            multiline
            autoFocus
          />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.sm }}>
            <CalmButton label="Save" variant="primary" onPress={saveText} style={{ flex: 1 }} />
            <CalmButton label="Cancel" variant="ghost" onPress={() => { setText(''); setMode('list'); }} style={{ flex: 1 }} />
          </View>
        </View>
      )}

      {mode === 'record' && <VoiceRecorder onDone={() => setMode('list')} onCancel={() => setMode('list')} />}
    </Screen>
  );
}

function VoiceRecorder({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { palette } = useTheme();
  const addVoice = useMemoriesStore((s) => s.addVoice);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 200);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [readyToSave, setReadyToSave] = useState(false);
  const isRecordingRef = useRef(false);
  isRecordingRef.current = state.isRecording;

  // Leaving this screen mid-recording (back gesture, backgrounding the app,
  // an incoming call) must not leave the microphone running silently.
  useEffect(() => {
    return () => {
      if (isRecordingRef.current) recorder.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      setPermissionDenied(true);
      return;
    }
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stop = async () => {
    await recorder.stop();
    setReadyToSave(true);
  };

  const save = () => {
    if (recorder.uri) addVoice(recorder.uri);
    onDone();
  };

  if (permissionDenied) {
    return (
      <View style={[styles.form, { borderColor: palette.border, backgroundColor: palette.surface, alignItems: 'center' }]}>
        <Body color={palette.textMuted} center>
          Ebb needs microphone access to record your voice. Nothing is sent anywhere — it stays on
          this device.
        </Body>
        <CalmButton label="Back" variant="ghost" style={{ marginTop: spacing.md }} onPress={onCancel} />
      </View>
    );
  }

  return (
    <View style={[styles.form, { borderColor: palette.border, backgroundColor: palette.surface, alignItems: 'center' }]}>
      <Headline center>{state.isRecording ? 'Recording…' : readyToSave ? 'Got it.' : 'Say whatever you want future-you to hear.'}</Headline>
      <View style={{ marginTop: spacing.xl, gap: 10, width: '100%' }}>
        {!state.isRecording && !readyToSave && (
          <CalmButton label="Start recording" variant="primary" size="large" style={{ width: '100%' }} onPress={start} />
        )}
        {state.isRecording && (
          <CalmButton label="Stop" variant="danger" size="large" style={{ width: '100%' }} onPress={stop} />
        )}
        {readyToSave && (
          <CalmButton label="Save this" variant="primary" size="large" style={{ width: '100%' }} onPress={save} />
        )}
        <CalmButton label="Cancel" variant="ghost" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { padding: spacing.md, borderRadius: radii.md, borderWidth: 1, marginBottom: spacing.lg },
  bodyInput: { fontSize: 16, minHeight: 120, textAlignVertical: 'top' },
  card: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radii.md, borderWidth: 1, gap: 10 },
});
