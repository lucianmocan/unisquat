import { useSettings } from '@/contexts/SettingsContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics } from '@/services/haptics';
import { dyslexiaFontFamily } from '@/utils/dyslexia-font';
import RNSegmentedControl, { type NativeSegmentedControlIOSChangeEvent } from '@react-native-segmented-control/segmented-control';
import { NativeSyntheticEvent, StyleSheet } from 'react-native';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

/** Thin wrapper around the real native UISegmentedControl / Android equivalent. */
export function SegmentedControl({ options, selectedIndex, onChange }: SegmentedControlProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const { settings } = useSettings();

  return (
    <RNSegmentedControl
      values={options}
      selectedIndex={selectedIndex}
      onChange={(event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
        haptics.impact();
        onChange(event.nativeEvent.selectedSegmentIndex);
      }}
      tintColor={tintColor}
      fontStyle={{ color: textColor, fontFamily: dyslexiaFontFamily(settings.dyslexiaFont) }}
      activeFontStyle={{ color: '#ffffff', fontFamily: dyslexiaFontFamily(settings.dyslexiaFont, true) }}
      style={styles.control}
    />
  );
}

const styles = StyleSheet.create({
  control: {
    // Must be an explicit height, not minHeight — this native view (UISegmentedControl via a
    // custom ViewManager) doesn't report its own intrinsic content size back to Yoga, so with no
    // explicit height it collapses to ~0 instead of growing to fit its label text.
    height: 36,
  },
});
