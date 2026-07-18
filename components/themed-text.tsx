import { Text, type TextProps, type TextStyle } from 'react-native';

import { useSettings } from '@/contexts/SettingsContext';
import { useBoldText } from '@/hooks/use-bold-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'label';
};

type TypeKey = NonNullable<ThemedTextProps['type']>;

// Base sizes at fontScale 1 — the one source of truth for every variant, scaled live by the
// Text Size setting and (for weight) swapped between the two dyslexia-font files below.
const TYPE_CONFIG: Record<TypeKey, { fontSize: number; lineHeight?: number; fontWeight?: TextStyle['fontWeight'] }> = {
  default: { fontSize: 16, lineHeight: 24 },
  defaultSemiBold: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  // No explicit lineHeight — a fixed number (even one bigger than fontSize) can still clip tall
  // capitals/accents once the font itself changes: OpenDyslexic's glyphs run taller than the
  // system font's at the same point size, so any one magic number picked for one font can clip
  // the other. Leaving lineHeight unset falls back to each font's own natural metrics, which by
  // definition never clip that font's own glyphs.
  title: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { fontSize: 20, fontWeight: 'bold' },
  link: { fontSize: 16, lineHeight: 30 },
  caption: { fontSize: 13 },
  label: { fontSize: 14, fontWeight: '500' },
};

// Types already at semibold-or-heavier weight need no further boost from Bold Text.
const ALREADY_BOLD: TypeKey[] = ['defaultSemiBold', 'title', 'subtitle'];

function isHeavyWeight(weight?: TextStyle['fontWeight']): boolean {
  return weight === 'bold' || weight === '600' || weight === '700' || weight === '800' || weight === '900';
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colorKey = type === 'link' ? 'tint' : type === 'caption' ? 'icon' : 'text';
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorKey);
  const boldText = useBoldText();
  const { settings } = useSettings();

  const config = TYPE_CONFIG[type];
  // Our styles set explicit fontWeights, which bypasses the OS's automatic Bold Text font
  // substitution for plain system-font labels — so this setting needs its own boost.
  const effectiveWeight = boldText && !ALREADY_BOLD.includes(type) ? '600' : config.fontWeight;
  const useDyslexicFont = settings.dyslexiaFont;

  return (
    <Text
      style={[
        {
          color,
          fontSize: config.fontSize * settings.fontScale,
          lineHeight: config.lineHeight ? config.lineHeight * settings.fontScale : undefined,
          // A custom TTF is a single fixed weight per file — asking it for a synthetic bold via
          // fontWeight renders wrong (or is silently ignored), so the bold-vs-regular choice is
          // made by swapping the file instead, and fontWeight is cleared so it doesn't fight that.
          fontWeight: useDyslexicFont ? undefined : effectiveWeight,
          fontFamily: useDyslexicFont ? (isHeavyWeight(effectiveWeight) ? 'OpenDyslexic-Bold' : 'OpenDyslexic') : undefined,
        },
        style,
      ]}
      {...rest}
    />
  );
}
