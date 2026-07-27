import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Caption } from '@/theme/Type';
import { spacing, radii } from '@/theme/tokens';
import { EnvironmentId, ENVIRONMENT_LABELS, ENVIRONMENT_EMOJI } from '@/components/environments/types';
import { useSettingsStore } from '@/store/useSettingsStore';

const ALL: EnvironmentId[] = ['night', 'rain', 'ocean', 'fire', 'forest', 'clouds', 'sunset', 'abstract'];

interface Props {
  value: EnvironmentId;
  onChange: (id: EnvironmentId) => void;
  options?: EnvironmentId[];
}

export function EnvironmentPicker({ value, onChange, options = ALL }: Props) {
  const { palette } = useTheme();
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  return (
    <View style={styles.grid}>
      {options.map((id) => {
        const active = value === id;
        return (
          <Pressable
            key={id}
            onPress={() => {
              if (hapticsEnabled) Haptics.selectionAsync().catch(() => {});
              onChange(id);
            }}
            style={[
              styles.card,
              {
                backgroundColor: active ? palette.surfaceRaised : palette.surface,
                borderColor: active ? palette.accent : palette.border,
              },
            ]}
          >
            <Body>{ENVIRONMENT_EMOJI[id]}</Body>
            <Caption color={active ? palette.text : palette.textMuted} style={{ marginTop: 4 }}>
              {ENVIRONMENT_LABELS[id]}
            </Caption>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '30%',
    minWidth: 96,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
  },
});
