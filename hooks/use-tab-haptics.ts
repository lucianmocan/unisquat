import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

/**
 * Fires a light haptic tap whenever this screen regains focus (e.g. switching to its tab).
 * NativeTabs has no press-level hook like the old HapticTab, so this approximates it via
 * focus instead — skips the very first mount so cold app launch doesn't buzz.
 */
export function useTabHaptics() {
  const hasMounted = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (hasMounted.current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      hasMounted.current = true;
    }, [])
  );
}
