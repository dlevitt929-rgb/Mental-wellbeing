import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Linking, AppState, AppStateStatus } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, LinearTransition, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
  setAudioModeAsync,
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

      {mode === 'record' && (
        <VoiceRecorder onDone={() => setMode('list')} onCancel={() => setMode('list')} onWriteInstead={() => setMode('write')} />
      )}
    </Screen>
  );
}

type PermissionUiState = 'unknown' | 'denied-retry' | 'denied-permanent';

function VoiceRecorder({
  onDone,
  onCancel,
  onWriteInstead,
}: {
  onDone: () => void;
  onCancel: () => void;
  onWriteInstead: () => void;
}) {
  const { palette } = useTheme();
  const addVoice = useMemoriesStore((s) => s.addVoice);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 200);
  const [permissionState, setPermissionState] = useState<PermissionUiState>('unknown');
  const [readyToSave, setReadyToSave] = useState(false);
  const isRecordingRef = useRef(false);
  isRecordingRef.current = state.isRecording;
  // Guards against a double-tap on "Start recording" firing two overlapping
  // prepareToRecordAsync()/record() calls before state has a chance to update.
  const startingRef = useRef(false);

  // The recording session reserves the mic at the OS level (allowsRecording)
  // — this must be released the same way it was claimed, on every exit path:
  // Stop/Save, unmount (back gesture), and going to background mid-recording.
  const releaseMic = async () => {
    try {
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      // Best-effort — nothing more to do if the native side already tore this down.
    }
  };

  // Leaving this screen mid-recording (back gesture, an incoming call cutting
  // the screen away) must not leave the microphone running silently.
  useEffect(() => {
    return () => {
      if (isRecordingRef.current) {
        recorder.stop().catch(() => {});
        releaseMic();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Without the background-recording entitlement (deliberately not requested
  // — this app has no genuine need to keep recording once it's not visible),
  // iOS/Android will interrupt the session anyway when backgrounded. Stopping
  // proactively turns that into "here's what you got, want to save it?"
  // instead of a silently corrupted or stuck recording state on return.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next !== 'active' && isRecordingRef.current) {
        recorder.stop().then(() => setReadyToSave(true)).catch(() => {});
        releaseMic();
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    if (startingRef.current || state.isRecording) return;
    startingRef.current = true;
    try {
      const current = await getRecordingPermissionsAsync();
      let granted = current.granted;
      let canAskAgain = current.canAskAgain;
      if (!granted && canAskAgain) {
        const requested = await requestRecordingPermissionsAsync();
        granted = requested.granted;
        canAskAgain = requested.canAskAgain;
      }
      if (!granted) {
        setPermissionState(canAskAgain ? 'denied-retry' : 'denied-permanent');
        return;
      }
      setPermissionState('unknown');
      await setAudioModeAsync({ allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      // A real device/OS-level failure (e.g. mic already claimed elsewhere) —
      // never leave the screen stuck on a silent, unexplained non-response.
      await releaseMic();
      setPermissionState('denied-retry');
    } finally {
      startingRef.current = false;
    }
  };

  const stop = async () => {
    try {
      await recorder.stop();
      setReadyToSave(true);
    } finally {
      await releaseMic();
    }
  };

  const save = () => {
    if (recorder.uri) addVoice(recorder.uri);
    onDone();
  };

  if (permissionState !== 'unknown') {
    return (
      <View style={[styles.form, { borderColor: palette.border, backgroundColor: palette.surface, alignItems: 'center' }]}>
        <Body color={palette.textMuted} center>
          Ebb needs microphone access to record your voice. Nothing is sent anywhere — it stays on
          this device.
        </Body>
        {permissionState === 'denied-permanent' ? (
          <>
            <Caption color={palette.textFaint} center style={{ marginTop: spacing.sm }}>
              It looks like microphone access was turned off for Ebb. You can turn it back on in
              Settings → Ebb → Microphone.
            </Caption>
            <CalmButton
              label="Open Settings"
              variant="primary"
              style={{ marginTop: spacing.md, width: '100%' }}
              onPress={() => Linking.openSettings().catch(() => {})}
            />
          </>
        ) : (
          <CalmButton label="Try again" variant="primary" style={{ marginTop: spacing.md, width: '100%' }} onPress={start} />
        )}
        <CalmButton label="Write it instead" style={{ marginTop: spacing.sm, width: '100%' }} onPress={onWriteInstead} />
        <CalmButton label="Back" variant="ghost" onPress={onCancel} />
      </View>
    );
  }

  return (
    <View style={[styles.form, { borderColor: palette.border, backgroundColor: palette.surface, alignItems: 'center' }]}>
      {state.isRecording && <RecordingIndicator />}
      <Headline center style={{ marginTop: state.isRecording ? spacing.sm : 0 }}>
        {state.isRecording ? 'Recording…' : readyToSave ? 'Got it.' : 'Say whatever you want future-you to hear.'}
      </Headline>
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
        {!state.isRecording && <CalmButton label="Write it instead" variant="ghost" onPress={onWriteInstead} />}
        <CalmButton label="Cancel" variant="ghost" onPress={onCancel} />
      </View>
    </View>
  );
}

/** A small pulsing dot — an unambiguous, always-visible "the mic is live"
 *  signal that doesn't depend on reading the headline text. */
function RecordingIndicator() {
  const { palette } = useTheme();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return <Animated.View style={[styles.recordingDot, dotStyle, { backgroundColor: palette.danger }]} />;
}

const styles = StyleSheet.create({
  form: { padding: spacing.md, borderRadius: radii.md, borderWidth: 1, marginBottom: spacing.lg },
  bodyInput: { fontSize: 16, minHeight: 120, textAlignVertical: 'top' },
  card: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radii.md, borderWidth: 1, gap: 10 },
  recordingDot: { width: 14, height: 14, borderRadius: 7 },
});
