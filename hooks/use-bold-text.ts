import { useSettings } from '@/contexts/SettingsContext';
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * True if the device's own Bold Text accessibility setting is on, OR the user opted into this
 * app's own override — either is enough. This carries real weight on its own: our styles set
 * explicit `fontWeight`s (see components/themed-text.tsx), which bypasses the OS's automatic
 * Bold Text font substitution for plain system-font labels.
 */
export function useBoldText(): boolean {
  const { settings } = useSettings();
  const [systemValue, setSystemValue] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isBoldTextEnabled().then(setSystemValue);
    const subscription = AccessibilityInfo.addEventListener('boldTextChanged', setSystemValue);
    return () => subscription.remove();
  }, []);

  return settings.boldText || systemValue;
}
