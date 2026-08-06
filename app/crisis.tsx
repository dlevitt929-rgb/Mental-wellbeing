import React from 'react';
import { View, StyleSheet, Linking, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { Whisper, Body, Headline, Caption } from '@/theme/Type';
import { useTheme, useModeOnFocus } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { CRISIS_RESOURCES, RESPONSIBLE_MEDICAL_LINE, getLocalEmergencyNumber } from '@/engines/safety';

export default function Crisis() {
  useModeOnFocus('night');
  const { palette } = useTheme();
  const { level } = useLocalSearchParams<{ level?: string }>();
  const localEmergency = getLocalEmergencyNumber();

  return (
    <Screen scroll>
      <Whisper style={{ marginTop: spacing.lg }}>
        {level === 'medical'
          ? 'Your safety comes first.'
          : 'You matter, and you don’t have to go through this alone.'}
      </Whisper>

      {level === 'medical' && (
        <Body color={palette.textMuted} style={{ marginTop: spacing.md }}>
          {RESPONSIBLE_MEDICAL_LINE}
        </Body>
      )}

      {level !== 'medical' && (
        <Body color={palette.textMuted} style={{ marginTop: spacing.md }}>
          Ebb isn’t able to keep you safe in a crisis — but real people who can help are
          available right now, for free, any time.
        </Body>
      )}

      {localEmergency ? (
        <>
          <CalmButton
            label={`Call emergency services (${localEmergency.number})`}
            variant="danger"
            size="large"
            style={{ marginTop: spacing.xl }}
            onPress={() => Linking.openURL(`tel:${localEmergency.number}`).catch(() => {})}
          />
          <Caption color={palette.textFaint} style={{ marginTop: spacing.sm }}>
            Guessed from your device's language & region setting for {localEmergency.region} — not your
            actual location. If that's not where you are right now, use your local emergency number
            instead.
          </Caption>
        </>
      ) : (
        <Caption color={palette.textFaint} style={{ marginTop: spacing.xl }}>
          Ebb can't reliably guess your local emergency number. Please dial it directly — 911 in the
          US and Canada, 999 in the UK, 112 across most of the EU, 000 in Australia, or search
          "emergency number" for your country.
        </Caption>
      )}

      <View style={{ marginTop: spacing.xl, gap: 12 }}>
        <Headline>Crisis support lines</Headline>
        {CRISIS_RESOURCES.map((r) => (
          <Pressable
            key={r.name}
            onPress={() =>
              Linking.openURL(r.kind === 'call' ? `tel:${r.contact.replace(/\s/g, '')}` : `sms:${r.contact}`).catch(() => {})
            }
            style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <Body>{r.name}</Body>
            <Caption color={palette.textMuted}>{r.region} · {r.kind === 'call' ? 'Call' : 'Text'} {r.contact}</Caption>
          </Pressable>
        ))}
      </View>

      <Caption color={palette.textFaint} style={{ marginTop: spacing.lg }}>
        Ebb is not a substitute for professional mental health care or emergency services.
      </Caption>

      <CalmButton label="Take me back" variant="ghost" style={{ marginTop: spacing.xl }} onPress={() => router.replace('/home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radii.md, borderWidth: 1 },
});
