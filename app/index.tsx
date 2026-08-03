import React from 'react';
import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSettingsHydrated } from '@/hooks/useHydration';
import { BootSplash } from '@/components/BootSplash';

export default function Index() {
  const hydrated = useSettingsHydrated();
  const hasOnboarded = useSettingsStore((s) => s.hasOnboarded);

  if (!hydrated) return <BootSplash />;

  return <Redirect href={hasOnboarded ? '/home' : '/onboarding'} />;
}
