/**
 * Native chrome — navigation headers, the native tab bar, the native segmented control — doesn't
 * render through ThemedText, so the dyslexia-friendly font setting has to be applied to each of
 * them separately via their own font-family style prop. (The native date/time picker widget
 * itself has no such prop on either platform, so it's the one thing that can't follow this.)
 */
export function dyslexiaFontFamily(dyslexiaFont: boolean, bold = false): string | undefined {
  if (!dyslexiaFont) return undefined;
  return bold ? 'OpenDyslexic-Bold' : 'OpenDyslexic';
}
