import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSettingsHydrated } from '@/hooks/useHydration';
import { BootSplash } from '@/components/BootSplash';
import { markStartup } from '@/engines/perfInstrumentation';

export default function Index() {
  const hydrated = useSettingsHydrated();
  const hasOnboarded = useSettingsStore((s) => s.hasOnboarded);

  useEffect(() => {
    if (hydrated) markStartup('settings-hydrated');
  }, [hydrated]);

  if (!hydrated) return <BootSplash />;

  return <Redirect href={hasOnboarded ? '/home' : '/onboarding'} />;
}
