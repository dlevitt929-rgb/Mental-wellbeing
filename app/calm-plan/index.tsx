import React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { FloatingHelpButton } from '@/components/FloatingHelpButton';
import { CalmPlanSection } from '@/components/CalmPlanSection';
import { Title, Body, Headline, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useContactsStore } from '@/store/useContactsStore';

export default function CalmPlan() {
  const { palette } = useTheme();
  const contactsCount = useContactsStore((s) => s.contacts.length);

  return (
    <Screen scroll overlay={<FloatingHelpButton />}>
      <Title style={{ marginTop: spacing.lg }}>My Calm Plan</Title>
      <Body color={palette.textMuted} style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
        Written while you're feeling okay, so it's ready for you when you're not.
      </Body>

      <Pressable
        onPress={() => router.push('/contacts')}
        style={{
          padding: spacing.md,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: palette.border,
          backgroundColor: palette.surface,
          marginBottom: spacing.xl,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Headline>People I trust</Headline>
          <Caption color={palette.textMuted} style={{ marginTop: 2 }}>
            {contactsCount === 0 ? 'Add someone you can reach out to' : `${contactsCount} saved`}
          </Caption>
        </View>
        <Caption color={palette.accent}>Manage →</Caption>
      </Pressable>

      <CalmPlanSection category="things-that-calm-me" title="Things that normally calm me" placeholder="e.g. a hot shower, my dog" />
      <CalmPlanSection category="songs" title="Songs that calm me" placeholder="e.g. Clair de Lune" />
      <CalmPlanSection category="places" title="Places that make me feel grounded" placeholder="e.g. my childhood kitchen" />
      <CalmPlanSection category="things-to-remember" title="Things I need to remember during panic" placeholder="e.g. this always passes" />
      <CalmPlanSection category="reasons-it-will-be-okay" title="Reasons things will be okay" placeholder="e.g. I've survived every panic attack so far" />
    </Screen>
  );
}
