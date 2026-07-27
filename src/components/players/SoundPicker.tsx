import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';
import { useSound } from '@/engines/SoundProvider';
import { SoundId, SOUND_LABELS } from '@/engines/soundEngine';

const IDS: SoundId[] = ['rain', 'ocean', 'wind', 'fireplace', 'brown', 'room'];

export function SoundPicker() {
  const { palette } = useTheme();
  const { current, play, stop } = useSound();

  return (
    <View style={styles.wrap}>
      {IDS.map((id) => {
        const active = current === id;
        return (
          <Pressable
            key={id}
            onPress={() => (active ? stop() : play(id, 0.4))}
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
