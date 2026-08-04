import { useEffect, useState } from 'react';
import { AccessibilityInfo, useWindowDimensions } from 'react-native';

/**
 * The two OS-level signals that should slow down guided text pacing: a
 * screen reader narrating the line, and a larger system text size meaning
 * more words per visual line (and more time to read them).
 */
export function useAccessibilityInfo() {
  const { fontScale } = useWindowDimensions();
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((enabled) => {
        if (mounted) setScreenReaderEnabled(enabled);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReaderEnabled);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return { fontScale, screenReaderEnabled };
}
