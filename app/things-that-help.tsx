import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/EmptyState';
import { Title, Body } from '@/theme/Type';
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
        <EmptyState
          glyph="✦"
          message="Give it a little more time, and this page will start to notice what helps."
          secondary="Nothing to look at yet — that's alright."
        />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radii.md, borderWidth: 1 },
});
