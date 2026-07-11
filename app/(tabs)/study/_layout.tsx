import { Stack } from 'expo-router';

export default function StudyLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Study', headerLargeTitle: true }} />
      <Stack.Screen name="[departmentId]/index" options={{ title: '' }} />
      <Stack.Screen name="[departmentId]/room/[roomId]" options={{ title: '' }} />
    </Stack>
  );
}
