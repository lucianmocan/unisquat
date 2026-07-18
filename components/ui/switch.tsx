import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics } from '@/services/haptics';
import { Switch as RNSwitch } from 'react-native';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** Thin themed wrapper around the native Switch — fires a light haptic on toggle. */
export function Switch({ value, onValueChange }: SwitchProps) {
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const handleValueChange = (next: boolean) => {
    haptics.impact();
    onValueChange(next);
  };

  return (
    <RNSwitch
      value={value}
      onValueChange={handleValueChange}
      trackColor={{ false: borderColor, true: tintColor }}
    />
  );
}
