import React, { useState } from 'react';
import { View, StyleSheet, Linking, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body, Caption, Headline } from '@/theme/Type';
import { useTheme, useModeOnFocus } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useContactsStore } from '@/store/useContactsStore';

const REACH_OUT_MESSAGE =
  "Hey, I'm feeling pretty overwhelmed right now. Could you stay on the phone with me for a few minutes?";

export default function Connection() {
  useModeOnFocus('reflect');
  const { palette } = useTheme();
  const contacts = useContactsStore((s) => s.contacts);
  const [pickerFor, setPickerFor] = useState<'call' | 'text' | null>(null);

  const act = (kind: 'call' | 'text') => {
    if (contacts.length === 0) {
      router.push('/contacts');
      return;
    }
    if (contacts.length === 1) {
      contactAction(contacts[0].phone, kind);
      return;
    }
    setPickerFor(kind);
  };

  const contactAction = (phone: string | undefined, kind: 'call' | 'text') => {
    if (!phone) {
      router.push('/contacts');
      return;
    }
    if (kind === 'call') Linking.openURL(`tel:${phone}`).catch(() => {});
    else Linking.openURL(`sms:${phone}?body=${encodeURIComponent(REACH_OUT_MESSAGE)}`).catch(() => {});
  };

  return (
    <Screen scroll>
      <Title style={{ marginTop: spacing.lg }}>I don't want to be alone</Title>
      <Body color={palette.textMuted} style={{ marginTop: spacing.sm }}>
        Reaching out isn't a last resort. It's one of the things that helps most.
      </Body>

      {pickerFor ? (
        <View style={{ marginTop: spacing.xl, gap: 10 }}>
          <Headline>Who should I reach?</Headline>
          {contacts.map((c) => (
            <CalmButton
              key={c.id}
              label={c.name}
              sublabel={c.helpsWithText}
              onPress={() => {
                contactAction(c.phone, pickerFor);
                setPickerFor(null);
              }}
              style={{ width: '100%' }}
            />
          ))}
          <CalmButton label="Never mind" variant="ghost" onPress={() => setPickerFor(null)} />
        </View>
      ) : (
        <View style={{ marginTop: spacing.xl, gap: 10 }}>
          <CalmButton label="Call someone I trust" onPress={() => act('call')} style={{ width: '100%' }} />
          <CalmButton label="Text someone" sublabel="We'll prefill a message for you" onPress={() => act('text')} style={{ width: '100%' }} />
          <CalmButton label="Stay with me" onPress={() => router.push('/stay-with-me')} style={{ width: '100%' }} />
          <CalmButton label="Talk to the AI" onPress={() => router.push({ pathname: '/stay-with-me', params: { tab: 'talk' } })} style={{ width: '100%' }} />
          <CalmButton label="Use a crisis or support resource" variant="ghost" onPress={() => router.push('/crisis')} style={{ width: '100%' }} />
        </View>
      )}

      {contacts.length === 0 && !pickerFor && (
        <Pressable onPress={() => router.push('/contacts')} style={{ marginTop: spacing.lg }}>
          <Caption color={palette.textFaint}>Add someone you trust so this is ready next time →</Caption>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radii.md, borderWidth: 1 },
});
