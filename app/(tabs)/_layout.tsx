import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

// Real native tab bar (UITabBarController / Material Tabs) — gets iOS 26's Liquid Glass
// automatically, falls back to the classic tab bar on iOS 18 and earlier, for free.
export default function TabLayout() {
  return (
    <NativeTabs tintColor={Colors.light.tint}>
      <NativeTabs.Trigger name="study">
        <Icon sf="magnifyingglass" androidSrc={<VectorIcon family={MaterialIcons} name="search" />} />
        <Label>Study</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf="gearshape.fill" androidSrc={<VectorIcon family={MaterialIcons} name="settings" />} />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
