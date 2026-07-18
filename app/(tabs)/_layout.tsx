import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";

import { useThemeColor } from "@/hooks/use-theme-color";

// Real native tab bar (UITabBarController / Material Tabs) — gets iOS 26's Liquid Glass
// automatically, falls back to the classic tab bar on iOS 18 and earlier, for free.
export default function TabLayout() {
  const { t } = useTranslation();
  // Also picks up the user's chosen accent color (Personalization settings) and — unlike the
  // hardcoded light-mode value this replaced — the correct dark-mode variant too.
  const tintColor = useThemeColor({}, "tint");

  return (
    <NativeTabs tintColor={tintColor}>
      <NativeTabs.Trigger name="study">
        <Icon
          sf="magnifyingglass"
          androidSrc={<VectorIcon family={MaterialIcons} name="search" />}
        />
        <Label>{t("tabs.browse")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon
          sf="gearshape.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="settings" />}
        />
        <Label>{t("tabs.settings")}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
