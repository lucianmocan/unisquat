/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { ACCENT_COLORS, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/contexts/SettingsContext';

export function useThemeColor<T extends keyof typeof Colors.light & keyof typeof Colors.dark>(
  props: { light?: string; dark?: string },
  colorName: T
): (typeof Colors.light)[T] {
  const theme = useColorScheme() ?? 'light';
  // The user's chosen accent color (Personalization settings) overrides the static 'tint' — every
  // other color key still comes from the plain theme constants below.
  const { settings } = useSettings();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps as (typeof Colors.light)[T];
  }
  if (colorName === 'tint') {
    return ACCENT_COLORS[settings.accentColor][theme] as (typeof Colors.light)[T];
  }
  return Colors[theme][colorName] as (typeof Colors.light)[T];
}
