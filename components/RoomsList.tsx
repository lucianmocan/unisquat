import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Department, Room } from '@/types';
import { router } from 'expo-router';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import RoomRow from './RoomRow';

interface RoomsListProps {
  rooms: Room[];
  now: boolean;
  department: Department;
}

export default function RoomsList({ rooms, now, department }: RoomsListProps) {
  // "Maintenant" shows rooms currently free; "Prochainement" shows rooms currently occupied
  const availableRooms = rooms.filter(room => room.isFree === now);

  const handleRoomPress = (room: Room) => {
    router.push(`/study/${department.id}/room/${encodeURIComponent(room.location)}`);
  };

  if (availableRooms.length === 0) {
    return (
      <ThemedView style={styles.emptyState}>
        <ThemedText style={styles.emptyStateText}>
          {now 
            ? "Malheureusement, aucune salle libre n'a été trouvée."
            : "Toutes les salles sont libres."
          }
        </ThemedText>
      </ThemedView>
    );
  }

  const renderRoomItem = ({ item }: { item: Room }) => (
    <TouchableOpacity
      onPress={() => handleRoomPress(item)}
      activeOpacity={0.7}
      style={styles.roomItemContainer}>
      <RoomRow room={item} />
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={availableRooms}
        renderItem={renderRoomItem}
        keyExtractor={(item, index) => `${item.location}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  roomItemContainer: {
    // TouchableOpacity wrapper for room items
  },
  separator: {
    height: 1,
    marginVertical: 12,
    opacity: 0.1,
    backgroundColor: '#666666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
});