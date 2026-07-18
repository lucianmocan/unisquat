import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useSettings } from '@/contexts/SettingsContext';
import { dyslexiaFontFamily } from '@/utils/dyslexia-font';

export default function SettingsLayout() {
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
          title: t('tabs.settings'),
          headerLargeTitle: true,
          headerTransparent: Platform.OS === 'ios',
          ...headerFontOptions,
        }}
      />
      <Stack.Screen name="about" options={{ title: t('settingsScreen.about'), ...headerFontOptions }} />
      <Stack.Screen
        name="personalization"
        options={{ title: t('settingsScreen.personalization'), headerTransparent: Platform.OS === 'ios', ...headerFontOptions }}
      />
      <Stack.Screen
        name="accessibility"
        options={{ title: t('settingsScreen.accessibility'), headerTransparent: Platform.OS === 'ios', ...headerFontOptions }}
      />
      <Stack.Screen
        name="language"
        options={{ title: t('settingsScreen.language'), headerTransparent: Platform.OS === 'ios', ...headerFontOptions }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{ title: t('settingsScreen.privacyPolicy'), headerTransparent: Platform.OS === 'ios', ...headerFontOptions }}
      />
      <Stack.Screen
        name="terms-of-service"
        options={{ title: t('settingsScreen.termsOfService'), headerTransparent: Platform.OS === 'ios', ...headerFontOptions }}
      />
    </Stack>
  );
}
