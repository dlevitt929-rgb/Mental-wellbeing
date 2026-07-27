import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { FloatingHelpButton } from '@/components/FloatingHelpButton';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body, Headline, Caption, Whisper } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { fonts } from '@/theme/useAppFonts';
import { useLettersStore } from '@/store/useLettersStore';

export default function Letters() {
  const { palette } = useTheme();
  const letters = useLettersStore((s) => s.letters);
  const add = useLettersStore((s) => s.add);
  const remove = useLettersStore((s) => s.remove);
  const markOpened = useLettersStore((s) => s.markOpened);
  const [writing, setWriting] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [title, setTitle] = useState('From calm me');
  const [body, setBody] = useState('');

  const save = () => {
    if (!body.trim()) return;
    add(title.trim() || 'From calm me', body.trim());
    setTitle('From calm me');
    setBody('');
    setWriting(false);
  };

  const openLetter = letters.find((l) => l.id === openId);
  if (openLetter) {
    return (
      <Screen center>
        <View style={styles.readWrap}>
          <Caption color={palette.textFaint}>{openLetter.title.toUpperCase()}</Caption>
          <Whisper center style={{ marginTop: spacing.lg }}>
            {openLetter.body}
          </Whisper>
          <CalmButton label="Close" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => setOpenId(null)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll overlay={<FloatingHelpButton />}>
      <Title style={{ marginTop: spacing.lg }}>Letters from calm you</Title>
      <Body color={palette.textMuted} style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
        Write something now, while things feel okay, for the version of you who might need it later.
      </Body>

      {writing ? (
        <View style={[styles.form, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={palette.textFaint}
            style={[styles.titleInput, { color: palette.text, fontFamily: fonts.bodySemibold }]}
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="David, you've felt like this before. It always passes..."
            placeholderTextColor={palette.textFaint}
            style={[styles.bodyInput, { color: palette.text, fontFamily: fonts.body }]}
            multiline
          />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.sm }}>
            <CalmButton label="Save" variant="primary" onPress={save} style={{ flex: 1 }} />
            <CalmButton label="Cancel" variant="ghost" onPress={() => setWriting(false)} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <CalmButton label="+ Write a letter" onPress={() => setWriting(true)} style={{ marginBottom: spacing.lg }} />
      )}

      <View style={{ gap: 10 }}>
        {letters.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => {
              markOpened(l.id);
              setOpenId(l.id);
            }}
            style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <View style={{ flex: 1 }}>
              <Headline>{l.title}</Headline>
              <Caption color={palette.textFaint} style={{ marginTop: 2 }}>
                Opened {l.timesOpened} time{l.timesOpened === 1 ? '' : 's'}
              </Caption>
            </View>
            <Pressable onPress={() => remove(l.id)}>
              <Caption color={palette.danger}>Remove</Caption>
            </Pressable>
          </Pressable>
        ))}
      </View>

      <CalmButton label="Back" variant="ghost" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { padding: spacing.md, borderRadius: radii.md, borderWidth: 1, marginBottom: spacing.lg },
  titleInput: { fontSize: 17, paddingVertical: 8 },
  bodyInput: { fontSize: 16, minHeight: 140, textAlignVertical: 'top', marginTop: 4 },
  card: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radii.md, borderWidth: 1, gap: 10 },
  readWrap: { width: '100%', alignItems: 'center', paddingHorizontal: spacing.md },
});
