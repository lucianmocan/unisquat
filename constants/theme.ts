/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// One brand accent shared by both modes — the default until the user picks a different one in
// Personalization settings (see ACCENT_COLORS below).
const tintColor = '#6a5acd';

// A curated set of accent color choices, each with a light- and dark-mode variant tuned
// separately: a color that reads well as a filled background (with white text/icons on top) or
// as plain text/icon color against a white surface often needs a *different*, usually brighter,
// variant to stay legible against the near-black dark-mode background — plain "one hex for both
// modes" doesn't hold for most hues (verified against WCAG contrast ratios; a couple of these
// intentionally deviate from Apple's stock system colors — e.g. green/orange/teal are Apple's
// system colors in dark mode, but darkened in light mode — because the light-mode stock values
// don't clear ~4.5:1 contrast against white when used as a filled chip background with white text).
// Display names live in i18n/locales/*.json under `accentColors.<key>` — not here — so they're
// translated; this key set and i18n/locales/*.json's `accentColors` keys must stay in sync.
export const ACCENT_COLORS = {
  purple: { light: tintColor, dark: tintColor },
  blue: { light: '#007AFF', dark: '#0A84FF' },
  indigo: { light: '#5856D6', dark: '#5E5CE6' },
  pink: { light: '#FF2D55', dark: '#FF375F' },
  red: { light: '#FF3B30', dark: '#FF453A' },
  orange: { light: '#C1660A', dark: '#FF9F0A' },
  green: { light: '#248A3D', dark: '#30D158' },
  teal: { light: '#007A8C', dark: '#40C8E0' },
} as const;

export type AccentColorKey = keyof typeof ACCENT_COLORS;
export const DEFAULT_ACCENT_COLOR: AccentColorKey = 'purple';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColor,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColor,
    card: '#ffffff',
    border: 'rgba(0,0,0,0.1)',
    // Darkened from the dark-mode values below (2.78:1 / 2.39:1 against white — under the 3:1
    // WCAG non-text contrast minimum for icons). Reuses ACCENT_COLORS.green/orange's already-
    // vetted light-mode values (4.40:1 / 4.06:1) rather than inventing new hex codes.
    success: '#248A3D',
    warning: '#C1660A',
    error: '#ff4444',
    favorite: '#ff4444',
    info: '#2196F3',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColor,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColor,
    card: '#1E2021',
    border: 'rgba(255,255,255,0.15)',
    success: '#4CAF50',
    warning: '#ff8800',
    error: '#ff4444',
    favorite: '#ff4444',
    info: '#2196F3',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Two radii, used consistently everywhere: containers/cards/inputs/buttons all share `md`;
// fully-rounded toggles/chips use `pill`. (The About screen's app-icon image is a deliberate
// one-off matching the OS icon mask, not part of this scale.)
export const Radius = {
  md: 12,
  pill: 999,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
