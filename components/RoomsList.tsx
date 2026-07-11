import { ThemedView } from '@/components/themed-view';
import { EmptyState } from '@/components/ui/empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Department, Room } from '@/types';
import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import RoomRow from './RoomRow';

interface RoomsListProps {
  rooms: Room[];
  now: boolean;
  department: Department;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function RoomsList({ rooms, now, department, isRefreshing = false, onRefresh }: RoomsListProps) {
  const tintColor = useThemeColor({}, 'tint');

  // "Maintenant" shows rooms currently free; "Prochainement" shows rooms currently occupied
  const availableRooms = rooms.filter(room => room.isFree === now);

  const handleRoomPress = (room: Room) => {
    router.push({
      pathname: '/study/[departmentId]/room/[roomId]',
      params: { departmentId: department.id, roomId: room.location },
    });
  };

  const renderRoomItem = ({ item }: { item: Room }) => (
    <TouchableOpacity
      onPress={() => handleRoomPress(item)}
      activeOpacity={0.7}
      style={styles.roomItemContainer}
      accessibilityRole="button"
      accessibilityLabel={`${item.location}, ${item.roomEvents?.length || 0} events`}>
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
        refreshControl={
          onRefresh ? <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={tintColor} /> : undefined
        }
        ListEmptyComponent={
          <EmptyState
            icon={now ? 'magnifyingglass' : 'checkmark.shield.fill'}
            title={now ? "Aucune salle libre n'a été trouvée" : 'Toutes les salles sont libres'}
            subtitle={
              now
                ? 'Essayez "Prochainement" ou une autre date'
                : "Aucune salle n'est actuellement occupée"
            }
          />
        }
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
    flexGrow: 1,
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
});
