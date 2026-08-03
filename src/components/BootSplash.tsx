import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

/**
 * What shows before fonts/settings have finished loading — before the theme
 * system itself is even mounted, so it can't reach for a palette. Kept
 * deliberately simple, but a soft breathing glow beats a dead rectangle for
 * however many hundred milliseconds this is on screen; the app should feel
 * calm from the very first frame, not just once it's fully booted.
 */
export function BootSplash() {
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.75, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={styles.fill}>
      <Animated.View style={[styles.glow, style]}>
        <LinearGradient
          colors={['rgba(231,166,92,0.22)', 'rgba(142,124,195,0.05)', 'rgba(11,15,20,0)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#0B0F14', alignItems: 'center', justifyContent: 'center' },
  glow: { width: 220, height: 220, borderRadius: 110, overflow: 'hidden' },
});
