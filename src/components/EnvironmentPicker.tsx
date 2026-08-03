import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { createAudioPlayer } from 'expo-audio';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Caption } from '@/theme/Type';
import { spacing, radii } from '@/theme/tokens';
import { EnvironmentId, ENVIRONMENT_LABELS, ENVIRONMENT_EMOJI } from '@/components/environments/types';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useHaptics } from '@/hooks/useHaptics';
import { soundForEnvironment, SOUND_SOURCES } from '@/engines/soundEngine';
import { useLongPressActions, ShortcutSheet } from '@/components/LongPressMenu';

const ALL: EnvironmentId[] = ['night', 'rain', 'ocean', 'fire', 'forest', 'clouds', 'sunset', 'abstract'];

interface Props {
  value: EnvironmentId;
  onChange: (id: EnvironmentId) => void;
  options?: EnvironmentId[];
  /** Only meaningful for real calming environments (breathing/sleep) — leave
   *  off for unrelated pickers like Guided Imagery's "place" selector. */
  enableShortcuts?: boolean;
}

export function EnvironmentPicker({ value, onChange, options = ALL, enableShortcuts }: Props) {
  const { palette } = useTheme();
  const { selection } = useHaptics();

  return (
    <View style={styles.grid}>
      {options.map((id) => {
        const active = value === id;
        return (
          <EnvironmentCard
            key={id}
            id={id}
            active={active}
            enableShortcuts={enableShortcuts}
            onPress={() => {
              selection();
              onChange(id);
            }}
          />
        );
      })}
    </View>
  );
}

function EnvironmentCard({
  id,
  active,
  onPress,
  enableShortcuts,
}: {
  id: EnvironmentId;
  active: boolean;
  onPress: () => void;
  enableShortcuts?: boolean;
}) {
  const { palette } = useTheme();
  const favoriteEnvironment = useSettingsStore((s) => s.favoriteEnvironment);
  const setFavoriteEnvironment = useSettingsStore((s) => s.setFavoriteEnvironment);
  const setCalmEnvironment = useSettingsStore((s) => s.setCalmEnvironment);
  const setSleepEnvironment = useSettingsStore((s) => s.setSleepEnvironment);
  const { softConfirmation } = useHaptics();

  const actions = enableShortcuts
    ? [
        {
          label: 'Preview sound',
          onPress: () => {
            const player = createAudioPlayer(SOUND_SOURCES[soundForEnvironment(id)]);
            player.play();
            setTimeout(() => player.pause(), 2500);
          },
        },
        {
          label: favoriteEnvironment === id ? 'Remove as favourite' : 'Set as favourite',
          onPress: () => {
            softConfirmation();
            setFavoriteEnvironment(favoriteEnvironment === id ? null : id);
          },
        },
        { label: 'Make default for sleep', onPress: () => setSleepEnvironment(id) },
        { label: 'Make default for breathing', onPress: () => setCalmEnvironment(id) },
      ]
    : [];
  const { visible, open, close } = useLongPressActions(actions.length);

  return (
    <>
      <Pressable
        onPress={onPress}
        onLongPress={actions.length > 0 ? open : undefined}
        delayLongPress={420}
        style={[
          styles.card,
          {
            backgroundColor: active ? palette.surfaceRaised : palette.surface,
            borderColor: active ? palette.accent : palette.border,
          },
        ]}
        accessibilityHint={actions.length > 0 ? 'Double tap and hold for quick shortcuts' : undefined}
      >
        <Body>{ENVIRONMENT_EMOJI[id]}</Body>
        <Caption color={active ? palette.text : palette.textMuted} style={{ marginTop: 4 }}>
          {ENVIRONMENT_LABELS[id]}
        </Caption>
      </Pressable>
      <ShortcutSheet visible={visible} onClose={close} actions={actions} title={ENVIRONMENT_LABELS[id]} />
    </>
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
