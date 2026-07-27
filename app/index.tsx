import React from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSettingsHydrated } from '@/hooks/useHydration';

export default function Index() {
  const hydrated = useSettingsHydrated();
  const hasOnboarded = useSettingsStore((s) => s.hasOnboarded);

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: '#0B0F14' }} />;

  return <Redirect href={hasOnboarded ? '/home' : '/onboarding'} />;
}
