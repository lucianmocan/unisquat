import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';

import { DepartmentsProvider } from '@/contexts/DepartmentsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Keep the native splash screen up until fonts are ready, instead of gating the root layout's
// own render behind `fontsLoaded` — returning null from Expo Router's root layout delays the
// Stack/navigator mounting, which is a known source of broken/flaky navigation behavior.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  // Loaded up front (not lazily when the dyslexia-font setting is first turned on) so flipping it
  // on in Personalization > Accessibility takes effect immediately, with no load flicker.
  const [fontsLoaded, fontError] = useFonts({
    'OpenDyslexic': require('@/assets/fonts/OpenDyslexic-Regular.ttf'),
    'OpenDyslexic-Bold': require('@/assets/fonts/OpenDyslexic-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return (
    <SettingsProvider>
      <DepartmentsProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: t('modal.headerTitle') }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </DepartmentsProvider>
    </SettingsProvider>
  );
}
