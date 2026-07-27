import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { FloatingHelpButton } from '@/components/FloatingHelpButton';
import { Title, Body, Headline, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { TOOLKIT_ITEMS } from '@/data/toolkit';

export default function ToolkitIndex() {
  const { palette } = useTheme();

  return (
    <Screen scroll overlay={<FloatingHelpButton />}>
      <Title style={{ marginTop: spacing.lg }}>The toolkit</Title>
      <Body color={palette.textMuted} style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        Nothing here is a prescription. Try a few, and Ebb will quietly learn what tends to work for you.
      </Body>

      <View style={{ gap: 10 }}>
        {TOOLKIT_ITEMS.map((item, i) => (
          <Animated.View key={item.id} entering={FadeInUp.delay(i * 30).duration(320)}>
            <Pressable
              onPress={() => router.push(item.route as any)}
              style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <View style={{ flex: 1 }}>
                <Headline>{item.title}</Headline>
                <Caption color={palette.textMuted} style={{ marginTop: 4 }}>
                  {item.blurb}
                </Caption>
              </View>
              <Caption color={palette.textFaint}>{item.minutes}</Caption>
            </Pressable>
          </Animated.View>
        ))}
      </View>
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
    gap: spacing.md,
  },
});
