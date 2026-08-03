import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { Whisper, Body, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { CAMERA_CHALLENGES } from '@/data/grounding';
import { useSessionStore } from '@/store/useSessionStore';
import { EXIT_COPY } from '@/theme/exitCopy';

export default function CameraGrounding() {
  const { palette } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [index, setIndex] = useState(0);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const [challenges] = useState(() => [...CAMERA_CHALLENGES].sort(() => Math.random() - 0.5).slice(0, 8));

  if (!permission) return <Screen center>{null}</Screen>;

  if (!permission.granted) {
    return (
      <Screen center>
        <View style={styles.block}>
          <Whisper center>Let's use what's actually around you.</Whisper>
          <Body color={palette.textMuted} center style={{ marginTop: spacing.md }}>
            Ebb only shows a live view to guide you — nothing is recorded, saved, or sent
            anywhere.
          </Body>
          <CalmButton
            label="Allow camera"
            variant="primary"
            size="large"
            style={{ marginTop: spacing.xl, width: '100%' }}
            onPress={requestPermission}
          />
          <CalmButton label={EXIT_COPY.notRightNow} variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const next = () => {
    if (index < challenges.length - 1) {
      setIndex((i) => i + 1);
    } else {
      logTechnique('sensory-grounding');
      router.back();
    }
  };

  return (
    <View style={styles.fill}>
      <CameraView style={styles.fill} facing="back" />
      <View style={styles.overlayTop}>
        <BlurView intensity={50} tint="dark" style={styles.promptCard}>
          <Animated.View key={index} entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)}>
            <Whisper center color="#fff">
              {challenges[index]}
            </Whisper>
          </Animated.View>
        </BlurView>
      </View>
      <View style={styles.overlayBottom}>
        <Pressable onPress={next} style={[styles.foundBtn, { backgroundColor: palette.accent }]}>
          <Body color="#1A1410">Found it</Body>
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ marginTop: spacing.md }}>
          <Caption color="#fff">Done for now</Caption>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  overlayTop: { position: 'absolute', top: 80, left: spacing.lg, right: spacing.lg },
  promptCard: { padding: spacing.lg, borderRadius: radii.lg, overflow: 'hidden' },
  overlayBottom: { position: 'absolute', bottom: 56, left: 0, right: 0, alignItems: 'center' },
  foundBtn: { paddingVertical: 16, paddingHorizontal: 40, borderRadius: radii.round },
  block: { width: '100%', alignItems: 'center', paddingHorizontal: spacing.md },
});
