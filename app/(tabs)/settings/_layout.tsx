import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerLargeTitle: true,
          headerTransparent: Platform.OS === 'ios',
        }}
      />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  );
}
