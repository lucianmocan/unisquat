import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';

import RoomDetail from '@/components/RoomDetail';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDepartments } from '@/contexts/DepartmentsContext';

export default function RoomDetailScreen() {
  const { departmentId, roomId } = useLocalSearchParams<{ departmentId: string; roomId: string }>();
  const { getDepartment } = useDepartments();
  const navigation = useNavigation();

  const department = getDepartment(Number(departmentId));
  const room = department?.rooms?.find(r => r.location === decodeURIComponent(roomId));

  useLayoutEffect(() => {
    if (room) {
      navigation.setOptions({ title: room.location });
    }
  }, [navigation, room]);

  if (!room) {
    return (
      <ThemedView style={styles.notFound}>
        <ThemedText>Room not found.</ThemedText>
      </ThemedView>
    );
  }

  return <RoomDetail room={room} />;
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
