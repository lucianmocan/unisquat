import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import RoomDetail from '@/components/RoomDetail';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDepartments } from '@/contexts/DepartmentsContext';

export default function RoomDetailScreen() {
  const { departmentId, roomId, referenceDate } = useLocalSearchParams<{
    departmentId: string;
    roomId: string;
    referenceDate?: string;
  }>();
  const { getDepartment } = useDepartments();

  const department = getDepartment(Number(departmentId));
  const room = department?.rooms?.find(r => r.location === roomId);

  if (!room) {
    return (
      <ThemedView style={styles.notFound}>
        <ThemedText>Room not found.</ThemedText>
      </ThemedView>
    );
  }

  const parsedReferenceDate = referenceDate ? new Date(referenceDate) : new Date();

  return <RoomDetail room={room} referenceDate={parsedReferenceDate} />;
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
