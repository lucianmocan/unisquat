import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics } from '@/services/haptics';
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

  return (
    <RNSegmentedControl
      values={options}
      selectedIndex={selectedIndex}
      onChange={(event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
        haptics.impact();
        onChange(event.nativeEvent.selectedSegmentIndex);
      }}
      tintColor={tintColor}
      fontStyle={{ color: textColor }}
      activeFontStyle={{ color: '#ffffff' }}
      style={styles.control}
    />
  );
}

const styles = StyleSheet.create({
  control: {
    height: 36,
  },
});
