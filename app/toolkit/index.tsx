import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Environment } from '@/components/environments/Environment';
import { FloatingHelpButton } from '@/components/FloatingHelpButton';
import { Title, Body, Headline, Caption } from '@/theme/Type';
import { fonts } from '@/theme/useAppFonts';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { hexToRgba } from '@/utils/color';
import { TOOLKIT_ITEMS, ToolkitItem } from '@/data/toolkit';
import { useNavigateWithWipe } from '@/engines/TransitionOverlay';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function ToolkitIndex() {
  const { palette } = useTheme();
  const calmEnvironment = useSettingsStore((s) => s.calmEnvironment);

  return (
    <Screen scroll overlay={<FloatingHelpButton />} backdrop={<Environment id={calmEnvironment} warmth={0} />}>
      <Title style={{ marginTop: spacing.lg }}>The toolkit</Title>
      <Body color={palette.textMuted} style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        Nothing here is a prescription. Try a few, and Ebb will quietly learn what tends to work for you.
      </Body>

      <View style={{ gap: 10 }}>
        {TOOLKIT_ITEMS.map((item, i) => (
          <Animated.View key={item.id} entering={FadeInUp.delay(i * 30).duration(320)}>
            <ToolkitRow item={item} />
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

function ToolkitRow({ item }: { item: ToolkitItem }) {
  const { palette } = useTheme();
  const ref = useRef<View>(null);
  const navigateWithWipe = useNavigateWithWipe();
  const press = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.98]) }],
  }));

  return (
    <Animated.View style={style}>
      <Pressable
        ref={ref}
        onPressIn={() => { press.value = withTiming(1, { duration: 100 }); }}
        onPressOut={() => { press.value = withTiming(0, { duration: 180 }); }}
        onPress={() => navigateWithWipe(ref, item.color, item.route)}
        style={[styles.card, { backgroundColor: palette.surface, borderColor: hexToRgba(item.color, 0.25) }]}
      >
        <View style={[styles.glyphWrap, { backgroundColor: hexToRgba(item.color, 0.16) }]}>
          <Text style={{ color: item.color, fontSize: 18, fontFamily: fonts.displayItalicMedium }}>{item.glyph}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Headline>{item.title}</Headline>
          <Caption color={palette.textMuted} style={{ marginTop: 4 }}>
            {item.blurb}
          </Caption>
        </View>
        <Caption color={palette.textFaint}>{item.minutes}</Caption>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  glyphWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
