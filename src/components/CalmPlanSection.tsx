import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { Headline, Body, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { fonts } from '@/theme/useAppFonts';
import { useCalmPlanStore } from '@/store/useCalmPlanStore';
import { CalmPlanEntry } from '@/types';

interface Props {
  category: CalmPlanEntry['category'];
  title: string;
  placeholder: string;
}

export function CalmPlanSection({ category, title, placeholder }: Props) {
  const { palette } = useTheme();
  const allEntries = useCalmPlanStore((s) => s.entries);
  const entries = useMemo(() => allEntries.filter((e) => e.category === category), [allEntries, category]);
  const add = useCalmPlanStore((s) => s.add);
  const remove = useCalmPlanStore((s) => s.remove);
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    add(category, trimmed);
    setText('');
  };

  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Headline>{title}</Headline>
      <View style={{ marginTop: spacing.sm, gap: 8 }}>
        {entries.map((e) => (
          <View key={e.id} style={[styles.row, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Body style={{ flex: 1 }}>{e.text}</Body>
            <Pressable onPress={() => remove(e.id)}>
              <Caption color={palette.danger}>Remove</Caption>
            </Pressable>
          </View>
        ))}
      </View>
      <View style={[styles.inputRow, { borderColor: palette.border }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={palette.textFaint}
          style={[styles.input, { color: palette.text, fontFamily: fonts.body }]}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <Pressable onPress={submit}>
          <Caption color={palette.accent}>Add</Caption>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginTop: 8,
  },
  input: { flex: 1, fontSize: 15 },
});
