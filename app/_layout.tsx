import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { AudioProvider } from '@/engines/audio/AudioProvider';
import { TransitionOverlayProvider } from '@/engines/TransitionOverlay';
import { useAppFonts } from '@/theme/useAppFonts';

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync('#0B0F14').catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#0B0F14' }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AudioProvider />
        <TransitionOverlayProvider>
          <AppChrome />
        </TransitionOverlayProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

/** Keeps the OS chrome (status bar, system background behind the safe area,
 *  route transition backdrop) in sync with the active light/dark scheme. */
function AppChrome() {
  const { palette, scheme } = useTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(palette.bg).catch(() => {});
  }, [palette.bg]);

  return (
    <>
      <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: palette.bg },
        }}
      />
    </>
  );
}
