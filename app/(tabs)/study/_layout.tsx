import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

export default function StudyLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t("tabs.browse"),
          headerLargeTitle: true,
          headerTransparent: Platform.OS === "ios",
        }}
      />
      <Stack.Screen
        name="[departmentId]/index"
        options={{ title: "", headerTransparent: Platform.OS === "ios" }}
      />
      <Stack.Screen
        name="[departmentId]/room/[roomId]"
        options={{ title: "", headerTransparent: Platform.OS === "ios" }}
      />
    </Stack>
  );
}
