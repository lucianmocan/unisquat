import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { useSettings } from "@/contexts/SettingsContext";
import { dyslexiaFontFamily } from "@/utils/dyslexia-font";

export default function StudyLayout() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  // The native header doesn't render through ThemedText, so the dyslexia-friendly font needs
  // its own wiring here — headerLargeTitleStyle/headerBackTitleStyle are iOS-only (harmless
  // no-ops on Android), headerTitleStyle applies on both platforms.
  const headerFontOptions = {
    headerTitleStyle: { fontFamily: dyslexiaFontFamily(settings.dyslexiaFont, true) },
    headerLargeTitleStyle: { fontFamily: dyslexiaFontFamily(settings.dyslexiaFont, true) },
    headerBackTitleStyle: { fontFamily: dyslexiaFontFamily(settings.dyslexiaFont, false) },
  };

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t("tabs.browse"),
          headerLargeTitle: true,
          headerTransparent: Platform.OS === "ios",
          ...headerFontOptions,
        }}
      />
      <Stack.Screen
        name="[departmentId]/index"
        options={{ title: "", headerTransparent: Platform.OS === "ios", ...headerFontOptions }}
      />
      <Stack.Screen
        name="[departmentId]/room/[roomId]"
        options={{ title: "", headerTransparent: Platform.OS === "ios", ...headerFontOptions }}
      />
    </Stack>
  );
}
