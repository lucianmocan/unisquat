import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

export default function SettingsLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t('tabs.settings'),
          headerLargeTitle: true,
          headerTransparent: Platform.OS === 'ios',
        }}
      />
      <Stack.Screen name="about" options={{ title: t('settingsScreen.about') }} />
      <Stack.Screen
        name="personalization"
        options={{ title: t('settingsScreen.personalization'), headerTransparent: Platform.OS === 'ios' }}
      />
      <Stack.Screen
        name="language"
        options={{ title: t('settingsScreen.language'), headerTransparent: Platform.OS === 'ios' }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{ title: t('settingsScreen.privacyPolicy'), headerTransparent: Platform.OS === 'ios' }}
      />
      <Stack.Screen
        name="terms-of-service"
        options={{ title: t('settingsScreen.termsOfService'), headerTransparent: Platform.OS === 'ios' }}
      />
    </Stack>
  );
}
