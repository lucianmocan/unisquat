import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: ReactNode;
}

/** A filter pill — filled with the tint color when selected. */
export function Chip({ label, selected, onPress, icon }: ChipProps) {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: 'rgba(255,255,255,0.1)' }, 'background');
  const textColor = useThemeColor({}, 'icon');

  return (
    <TouchableOpacity
      style={[styles.chip, { backgroundColor: selected ? tintColor : backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      {icon}
      <ThemedText type="label" style={{ color: selected ? '#ffffff' : textColor }}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    gap: Spacing.sm,
  },
});
