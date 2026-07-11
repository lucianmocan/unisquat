import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function StudyLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Study',
          headerLargeTitle: true,
          headerTransparent: Platform.OS === 'ios',
        }}
      />
      <Stack.Screen name="[departmentId]/index" options={{ title: '' }} />
      <Stack.Screen name="[departmentId]/room/[roomId]" options={{ title: '' }} />
    </Stack>
  );
}
