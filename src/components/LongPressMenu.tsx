import React, { useCallback, useState } from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Caption } from '@/theme/Type';
import { spacing, radii } from '@/theme/tokens';
import { useHaptics } from '@/hooks/useHaptics';

export interface LongPressAction {
  label: string;
  onPress: () => void;
}

/** Shared open/close state + haptic for any long-press shortcut sheet.
 *  Split out from the presentational sheet so components that already own
 *  a custom Pressable (like CalmTile, which needs a ref for its
 *  tap-to-transform animation) can wire long-press in directly instead of
 *  nesting a second Pressable around it. */
export function useLongPressActions(actionCount: number) {
  const { gentleArrival } = useHaptics();
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => {
    if (actionCount === 0) return;
    gentleArrival();
    setVisible(true);
  }, [actionCount, gentleArrival]);

  const close = useCallback(() => setVisible(false), []);

  return { visible, open, close };
}

interface ShortcutSheetProps {
  visible: boolean;
  onClose: () => void;
  actions: LongPressAction[];
  title?: string;
}

/** The small, calm shortcut sheet itself — a modal card, not a native menu. */
export function ShortcutSheet({ visible, onClose, actions, title }: ShortcutSheetProps) {
  const { palette } = useTheme();
  const { selection } = useHaptics();

  const runAction = (action: LongPressAction) => {
    selection();
    onClose();
    // Let the sheet visibly close before the action navigates or fires.
    setTimeout(() => action.onPress(), 90);
  };

  if (actions.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close shortcuts">
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(140)} style={[StyleSheet.absoluteFill, styles.backdrop]} />
      </Pressable>
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <Animated.View
          entering={ZoomIn.duration(180)}
          exiting={FadeOut.duration(120)}
          style={[styles.sheet, { backgroundColor: palette.surfaceRaised, borderColor: palette.border }]}
        >
          {title && (
            <Caption color={palette.textFaint} style={styles.title}>
              {title.toUpperCase()}
            </Caption>
          )}
          {actions.map((a, i) => (
            <Pressable
              key={a.label}
              onPress={() => runAction(a)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.item,
                i < actions.length - 1 && { borderBottomWidth: 1, borderBottomColor: palette.border },
                pressed && { opacity: 0.6 },
              ]}
            >
              <Body>{a.label}</Body>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

interface LongPressMenuProps {
  /** Shortcuts revealed on long-press. Empty/undefined means the wrapped
   *  element behaves like a plain Pressable — long-press is always an
   *  optional addition, never the only way to reach something. */
  actions?: LongPressAction[];
  title?: string;
  onPress?: () => void;
  children: React.ReactNode;
  style?: any;
  /** Extra accessibility hint appended to the child's label, since a screen
   *  reader user won't discover a long-press gesture the same way. */
  accessibilityLabel?: string;
}

/** Convenience wrapper for the common case: a plain row/link that doesn't
 *  already have its own Pressable. For anything with a custom Pressable
 *  (CalmTile, EnvironmentPicker cards), use useLongPressActions + ShortcutSheet
 *  directly instead. */
export function LongPressMenu({ actions = [], title, onPress, children, style, accessibilityLabel }: LongPressMenuProps) {
  const { visible, open, close } = useLongPressActions(actions.length);

  return (
    <>
      <Pressable
        onPress={onPress}
        onLongPress={actions.length > 0 ? open : undefined}
        delayLongPress={420}
        style={style}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={actions.length > 0 ? 'Double tap and hold for quick shortcuts' : undefined}
      >
        {children}
      </Pressable>
      <ShortcutSheet visible={visible} onClose={close} actions={actions} title={title} />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.45)' },
  sheetWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  sheet: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    paddingTop: spacing.md,
  },
  title: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  item: { paddingVertical: 16, paddingHorizontal: spacing.lg, minHeight: 48, justifyContent: 'center' },
});
