import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body, Caption, Headline } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useContactsStore } from '@/store/useContactsStore';
import { fonts } from '@/theme/useAppFonts';
import { EmptyState } from '@/components/EmptyState';

export default function Contacts() {
  const { palette } = useTheme();
  const contacts = useContactsStore((s) => s.contacts);
  const add = useContactsStore((s) => s.add);
  const remove = useContactsStore((s) => s.remove);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [helpsWithText, setHelpsWithText] = useState('');

  const save = () => {
    if (!name.trim()) return;
    add({ name: name.trim(), phone: phone.trim(), helpsWithText: helpsWithText.trim(), relationship: '' });
    setName('');
    setPhone('');
    setHelpsWithText('');
    setAdding(false);
  };

  return (
    <Screen scroll>
      <Title style={{ marginTop: spacing.lg }}>People I trust</Title>
      <Body color={palette.textMuted} style={{ marginTop: spacing.sm }}>
        So reaching out is one tap, even when it's hard to think.
      </Body>

      <View style={{ marginTop: spacing.lg, gap: 10 }}>
        {contacts.length === 0 && !adding && (
          <EmptyState
            glyph="◐"
            message="Choose the people you would feel safest reaching out to."
            actionLabel="Add someone"
            onAction={() => setAdding(true)}
          />
        )}
        {contacts.map((c) => (
          <View key={c.id} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View style={{ flex: 1 }}>
              <Headline>{c.name}</Headline>
              {!!c.phone && <Caption color={palette.textMuted}>{c.phone}</Caption>}
              {!!c.helpsWithText && (
                <Caption color={palette.textFaint} style={{ marginTop: 4 }}>
                  {c.helpsWithText}
                </Caption>
              )}
            </View>
            <Pressable onPress={() => remove(c.id)}>
              <Caption color={palette.danger}>Remove</Caption>
            </Pressable>
          </View>
        ))}
      </View>

      {adding ? (
        <View style={[styles.form, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={palette.textFaint}
            style={[styles.input, { color: palette.text, fontFamily: fonts.body }]}
          />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor={palette.textFaint}
            keyboardType="phone-pad"
            style={[styles.input, { color: palette.text, fontFamily: fonts.body }]}
          />
          <TextInput
            value={helpsWithText}
            onChangeText={setHelpsWithText}
            placeholder="e.g. hearing her voice usually helps"
            placeholderTextColor={palette.textFaint}
            style={[styles.input, { color: palette.text, fontFamily: fonts.body }]}
          />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.sm }}>
            <CalmButton label="Save" variant="primary" onPress={save} style={{ flex: 1 }} />
            <CalmButton label="Cancel" variant="ghost" onPress={() => setAdding(false)} style={{ flex: 1 }} />
          </View>
        </View>
      ) : contacts.length > 0 ? (
        <CalmButton label="+ Add someone" onPress={() => setAdding(true)} style={{ marginTop: spacing.lg }} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  form: { marginTop: spacing.lg, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, gap: 10 },
  input: { borderWidth: 0, fontSize: 16, paddingVertical: 8 },
});
