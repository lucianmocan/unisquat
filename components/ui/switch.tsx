import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics } from '@/services/haptics';
import { Switch as RNSwitch } from 'react-native';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /**
   * The Switch sits as a `right` sibling of its Row, not inside the Row's own accessible
   * touchable, so it's its own independent VoiceOver/TalkBack stop — without this it announces a
   * bare "On/Off, switch" with no indication of what it toggles.
   */
  accessibilityLabel?: string;
}

/** Thin themed wrapper around the native Switch — fires a light haptic on toggle. */
export function Switch({ value, onValueChange, accessibilityLabel }: SwitchProps) {
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
      accessibilityLabel={accessibilityLabel}
    />
  );
}
