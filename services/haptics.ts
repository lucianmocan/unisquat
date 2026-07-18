import * as Haptics from 'expo-haptics';

// A module-level flag rather than threading settings through every call site: haptics are fired
// imperatively from dozens of event handlers across the app, not rendered, so there's no JSX to
// hook a `useSettings()` read into — SettingsProvider just calls `setHapticsEnabled` once on load
// and again whenever the user flips the setting (see contexts/SettingsContext.tsx).
let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

export const ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = Haptics.NotificationFeedbackType;

/**
 * Drop-in replacements for expo-haptics's impactAsync/notificationAsync that no-op when the user
 * has turned haptics off in Personalization settings. Every call site in the app should go
 * through this instead of importing expo-haptics directly, so the on/off switch has exactly one
 * place to enforce.
 */
export const haptics = {
  impact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light): void {
    if (!enabled) return;
    Haptics.impactAsync(style);
  },
  notification(type: Haptics.NotificationFeedbackType): void {
    if (!enabled) return;
    Haptics.notificationAsync(type);
  },
};
