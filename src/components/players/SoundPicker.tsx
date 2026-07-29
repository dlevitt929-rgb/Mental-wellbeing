import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';
import { AudioManager, useAudioManagerStore } from '@/engines/audio/AudioManager';
import { SoundId, SOUND_LABELS } from '@/engines/soundEngine';

const IDS: SoundId[] = ['rain', 'ocean', 'wind', 'fireplace', 'brown', 'room'];

/** Deliberately its own stable owner — picking a sound here is meant to keep
 * playing after this screen is gone, as the person falls asleep. */
const OWNER_ID = 'sleep:sound-picker';

export function SoundPicker() {
  const { palette } = useTheme();
  const soundId = useAudioManagerStore((s) => (s.ownerId === OWNER_ID ? s.soundId : null));

  return (
    <View style={styles.wrap}>
      {IDS.map((id) => {
        const active = soundId === id;
        return (
          <Pressable
            key={id}
            onPress={() => (active ? AudioManager.release(OWNER_ID) : AudioManager.request(OWNER_ID, id, { volume: 0.4 }))}
            style={[
              styles.chip,
              {
                backgroundColor: active ? palette.accent : palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <Caption color={active ? '#1A1410' : palette.textMuted}>{SOUND_LABELS[id]}</Caption>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radii.round, borderWidth: 1 },
});
