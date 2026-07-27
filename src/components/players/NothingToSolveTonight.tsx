import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { Whisper, Body, Caption } from '@/theme/Type';
import { CalmButton } from '@/components/CalmButton';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useWorryStore } from '@/store/useWorryStore';
import { fonts } from '@/theme/useAppFonts';

interface Props {
  onDone: () => void;
  title?: string;
  subtitle?: string;
  boxLabel?: string;
  doneLabel?: string;
  emptyLabel?: string;
  remindTomorrow?: boolean;
}

export function NothingToSolveTonight({
  onDone,
  title = "You don't need to solve this tonight.",
  subtitle = "Write whatever is circling. I'll keep it somewhere safe until tomorrow.",
  boxLabel = 'TOMORROW',
  doneLabel = "That's enough for tonight",
  emptyLabel = 'Nothing right now',
  remindTomorrow = true,
}: Props) {
  const { palette } = useTheme();
  const [text, setText] = useState('');
  const [placed, setPlaced] = useState<string[]>([]);
  const add = useWorryStore((s) => s.add);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    add(trimmed, remindTomorrow);
    setPlaced((p) => [...p, trimmed]);
    setText('');
  };

  return (
    <View style={styles.wrap}>
      <Whisper center>{title}</Whisper>
      <Body color={palette.textMuted} center style={{ marginTop: spacing.sm }}>
        {subtitle}
      </Body>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="What's on your mind?"
        placeholderTextColor={palette.textFaint}
        style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.surface, fontFamily: fonts.body }]}
        onSubmitEditing={submit}
        returnKeyType="done"
        multiline
      />
      <CalmButton label="Set it down" onPress={submit} style={{ marginTop: spacing.sm, width: '100%' }} />

      {placed.length > 0 && (
        <View style={[styles.box, { borderColor: palette.border }]}>
          <Caption color={palette.textFaint} style={{ marginBottom: 8 }}>
            {boxLabel}
          </Caption>
          {placed.map((p, i) => (
            <Animated.View key={i} entering={FadeInDown.duration(420)} layout={LinearTransition} style={[styles.chip, { backgroundColor: palette.surfaceRaised }]}>
              <Caption color={palette.textMuted}>{p}</Caption>
            </Animated.View>
          ))}
        </View>
      )}

      <CalmButton
        label={placed.length ? doneLabel : emptyLabel}
        variant="primary"
        size="large"
        style={{ marginTop: spacing.xl, width: '100%' }}
        onPress={onDone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', paddingHorizontal: spacing.md },
  input: {
    marginTop: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  box: { marginTop: spacing.xl, width: '100%', borderWidth: 1, borderStyle: 'dashed', borderRadius: radii.md, padding: spacing.md, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.sm },
});
