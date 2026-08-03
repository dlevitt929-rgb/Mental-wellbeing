import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Dimensions, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  FadeIn,
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { CalmButton } from '@/components/CalmButton';
import { Whisper, Body, Caption } from '@/theme/Type';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, radii } from '@/theme/tokens';
import { fonts } from '@/theme/useAppFonts';
import { hexToRgba } from '@/utils/color';
import { useWorryStore } from '@/store/useWorryStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useHaptics } from '@/hooks/useHaptics';

const { height } = Dimensions.get('window');
const DROP_THRESHOLD = height * 0.28;

export default function PutItDown() {
  const { palette } = useTheme();
  const [text, setText] = useState('');
  const [card, setCard] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const haptics = useHaptics();
  const add = useWorryStore((s) => s.add);
  const resolve = useWorryStore((s) => s.resolve);
  const worries = useWorryStore((s) => s.worries);
  const logTechnique = useSessionStore((s) => s.logTechnique);
  const setAside = worries.filter((w) => !w.resolvedAt);

  const pickUp = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setCard(trimmed);
    setText('');
  };

  return (
    <Screen center>
      <View style={styles.block}>
        {!card ? (
          <>
            <Whisper center>What's weighing on you?</Whisper>
            <Body color={palette.textMuted} center style={{ marginTop: spacing.sm }}>
              Write it down, then drag it into the drawer. It'll be there when you're ready for it —
              not gone, just set aside.
            </Body>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type it here"
              placeholderTextColor={palette.textFaint}
              style={[
                styles.input,
                { color: palette.text, borderColor: palette.border, backgroundColor: palette.surface, fontFamily: fonts.body },
              ]}
              onSubmitEditing={pickUp}
              returnKeyType="done"
              multiline
            />
            <CalmButton label="Pick it up" variant="primary" size="large" style={{ marginTop: spacing.lg, width: '100%' }} onPress={pickUp} />
          </>
        ) : (
          <DragCard
            text={card}
            onSetAside={(t) => {
              add(t, false);
              logTechnique('worry-postponement');
              haptics.softConfirmation();
              setCard(null);
            }}
          />
        )}

        {!card && setAside.length > 0 && (
          <Pressable onPress={() => setShowDrawer((v) => !v)} style={{ marginTop: spacing.xl }}>
            <Caption color={palette.textMuted}>
              {showDrawer ? 'Close the drawer' : `Open the drawer (${setAside.length})`}
            </Caption>
          </Pressable>
        )}

        {!card && showDrawer && (
          <View style={[styles.drawerList, { borderColor: palette.border }]}>
            {setAside.map((w) => (
              <Animated.View
                key={w.id}
                entering={FadeInDown.duration(300)}
                layout={LinearTransition}
                style={[styles.drawerItem, { borderColor: palette.border }]}
              >
                <Body color={palette.textMuted} style={{ flex: 1 }}>
                  {w.text}
                </Body>
                <Pressable onPress={() => resolve(w.id)}>
                  <Caption color={palette.accent}>I've thought about it</Caption>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}
      </View>

      {!card && (
        <Pressable onPress={() => router.back()} style={styles.exit}>
          <Caption color={palette.textFaint}>Done for now</Caption>
        </Pressable>
      )}

      <Drawer open={Boolean(card)} />
    </Screen>
  );
}

function DragCard({ text, onSetAside }: { text: string; onSetAside: (text: string) => void }) {
  const { palette } = useTheme();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const settled = useSharedValue(false);

  const finishDrop = () => onSetAside(text);

  const pan = Gesture.Pan()
    .onChange((e) => {
      x.value += e.changeX;
      y.value += e.changeY;
    })
    .onEnd(() => {
      if (y.value > DROP_THRESHOLD) {
        settled.value = true;
        y.value = withTiming(DROP_THRESHOLD + 60, { duration: 260 }, (finished) => {
          if (finished) runOnJS(finishDrop)();
        });
        x.value = withTiming(0, { duration: 260 });
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
    opacity: settled.value ? withTiming(0, { duration: 220 }) : 1,
  }));

  return (
    <View style={styles.dragArea}>
      <Body color={palette.textMuted} center style={{ marginBottom: spacing.lg }}>
        Drag it down into the drawer, or just tap the button below.
      </Body>
      <GestureDetector gesture={pan}>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[styles.card, cardStyle, { backgroundColor: palette.surfaceRaised, borderColor: palette.border }]}
          accessibilityLabel={`${text}. Drag down to set aside, or use the button below.`}
        >
          <Body center>{text}</Body>
        </Animated.View>
      </GestureDetector>
      <CalmButton label="Set it aside" variant="primary" style={{ marginTop: spacing.xl, width: '100%' }} onPress={finishDrop} />
    </View>
  );
}

function Drawer({ open }: { open: boolean }) {
  const { palette } = useTheme();
  const openAmount = useSharedValue(0);
  React.useEffect(() => {
    openAmount.value = withTiming(open ? 1 : 0, { duration: 400 });
  }, [open, openAmount]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: openAmount.value * -14 }],
    opacity: 0.7 + openAmount.value * 0.3,
  }));

  return (
    <View pointerEvents="none" style={styles.drawerWrap}>
      <Animated.View style={[styles.drawerFront, frontStyle, { backgroundColor: hexToRgba(palette.accentGradient[1], 0.18), borderColor: palette.border }]}>
        <View style={[styles.drawerHandle, { backgroundColor: palette.border }]} />
      </Animated.View>
      <Caption color={palette.textFaint} style={{ marginTop: spacing.sm, textAlign: 'center' }}>
        drawer
      </Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', width: '100%', paddingHorizontal: spacing.lg },
  input: {
    marginTop: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dragArea: { alignItems: 'center', width: '100%' },
  card: {
    width: '86%',
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  exit: { position: 'absolute', bottom: 20, alignSelf: 'center', opacity: 0.5 },
  drawerWrap: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  drawerFront: {
    width: '70%',
    height: 54,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerHandle: { width: 40, height: 4, borderRadius: 2 },
  drawerList: { marginTop: spacing.lg, width: '100%', gap: 8 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
  },
});
