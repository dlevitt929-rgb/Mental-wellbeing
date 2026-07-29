import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { Title, Body, Whisper } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { useSessionStore } from '@/store/useSessionStore';
import { deriveInsights } from '@/engines/insights';

/** Not a dashboard, not a score — just a few gentle, first-person notices
 *  about what's tended to help, drawn from your own history here. */
export default function ThingsThatHelp() {
  const { palette } = useTheme();
  const sessions = useSessionStore((s) => s.sessions);
  const insights = useMemo(() => deriveInsights(sessions), [sessions]);

  return (
    <Screen scroll>
      <Title style={{ marginTop: spacing.lg }}>Things that help you</Title>
      <Body color={palette.textMuted} style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
        A few quiet observations from your own history here — never a score, never a diagnosis.
      </Body>

      {insights.length === 0 ? (
        <Whisper style={{ marginTop: spacing.xl }}>
          Come back here once you've used Ebb a little more. There isn't enough to notice yet.
        </Whisper>
      ) : (
        <View style={{ gap: 10 }}>
          {insights.map((line, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(i * 60).duration(320)}
              style={[styles.card, { borderColor: palette.border, backgroundColor: palette.surface }]}
            >
              <Body color={palette.text}>{line}</Body>
            </Animated.View>
          ))}
        </View>
      )}

      <CalmButton label="Back" variant="ghost" style={{ marginTop: spacing.xl }} onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radii.md, borderWidth: 1 },
});
