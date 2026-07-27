import React, { createContext, useCallback, useContext, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useCalmMotion } from '@/hooks/useCalmMotion';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TransitionContextValue {
  begin: (rect: Rect, color: string, navigate: () => void) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

/**
 * A tile "becomes" the next screen instead of the app just swapping pages:
 * the tile's own color expands to fill the viewport, we navigate underneath
 * it, then it fades away to reveal the destination already settled.
 */
export function TransitionOverlayProvider({ children }: { children: React.ReactNode }) {
  const { reduced } = useCalmMotion();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const w = useSharedValue(0);
  const h = useSharedValue(0);
  const radius = useSharedValue(24);
  const opacity = useSharedValue(0);
  const colorRef = useRef('#000000');
  const [, forceRender] = React.useReducer((c) => c + 1, 0);

  const begin = useCallback(
    (rect: Rect, color: string, navigate: () => void) => {
      colorRef.current = color;
      forceRender();

      if (reduced) {
        // Respect Reduce Motion: skip the expand choreography, just cut.
        navigate();
        return;
      }

      x.value = rect.x;
      y.value = rect.y;
      w.value = rect.width;
      h.value = rect.height;
      radius.value = 24;
      opacity.value = 1;

      const expandConfig = { duration: 460, easing: Easing.out(Easing.cubic) };
      x.value = withTiming(0, expandConfig);
      y.value = withTiming(0, expandConfig);
      w.value = withTiming(SCREEN_W, expandConfig);
      h.value = withTiming(SCREEN_H, expandConfig);
      radius.value = withTiming(0, expandConfig, (finished) => {
        if (finished) runOnJS(navigate)();
      });

      // Hold fully opaque through the expand + a beat for the destination to
      // mount underneath, then reveal it.
      opacity.value = withDelay(620, withTiming(0, { duration: 420, easing: Easing.inOut(Easing.sin) }));
    },
    [reduced, x, y, w, h, radius, opacity],
  );

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x.value,
    top: y.value,
    width: w.value,
    height: h.value,
    borderRadius: radius.value,
    opacity: opacity.value,
    backgroundColor: colorRef.current,
  }));

  return (
    <TransitionContext.Provider value={{ begin }}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.overlay, style]} />
    </TransitionContext.Provider>
  );
}

export function useTileTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error('useTileTransition must be used within TransitionOverlayProvider');
  return ctx;
}

/** Convenience: measure a ref, run the wipe, then push a route. */
export function useNavigateWithWipe() {
  const { begin } = useTileTransition();
  return useCallback(
    (nodeRef: React.RefObject<View | null>, color: string, href: string) => {
      const node = nodeRef.current;
      if (!node) {
        router.push(href as any);
        return;
      }
      node.measureInWindow((x, y, width, height) => {
        begin({ x, y, width, height }, color, () => router.push(href as any));
      });
    },
    [begin],
  );
}

const styles = StyleSheet.create({
  overlay: { zIndex: 999, elevation: 999 },
});
