import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardSeparator, Row } from '@/components/ui/card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Department, Room } from '@/types';
import { router } from 'expo-router';
import { Fragment } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';

interface RoomsListProps {
  rooms: Room[];
  now: boolean;
  department: Department;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

/** A short, relative "how long until this changes" label — e.g. "<30 min", "1h+", "3h+". */
function formatRelativeAvailability(timeString?: string) {
  if (!timeString) return '';

  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const target = new Date(timeString);
  if (target.getTime() >= endOfDay.getTime()) {
    return 'la fermeture';
  }

  const diffMinutes = Math.round((target.getTime() - now.getTime()) / 60000);
  if (diffMinutes <= 0) return 'maintenant';
  if (diffMinutes < 30) return '<30 min';
  if (diffMinutes < 60) return '<1h';
  return `${Math.floor(diffMinutes / 60)}h+`;
}

export default function RoomsList({ rooms, now, department, isRefreshing = false, onRefresh }: RoomsListProps) {
  const errorColor = useThemeColor({}, 'error');
  const tintColor = useThemeColor({}, 'tint');
  const insets = useSafeAreaInsets();

  // "Maintenant" shows rooms currently free; "Prochainement" shows rooms currently occupied
  const availableRooms = rooms.filter(room => room.isFree === now);

  const handleRoomPress = (room: Room) => {
    router.push({
      pathname: '/study/[departmentId]/room/[roomId]',
      params: { departmentId: department.id, roomId: room.location },
    });
  };

  if (availableRooms.length === 0) {
    return (
      <EmptyState
        icon={now ? 'magnifyingglass' : 'checkmark.circle.fill'}
        title={now ? "Aucune salle libre n'a été trouvée" : 'Toutes les salles sont libres'}
        subtitle={
          now
            ? 'Essayez "Prochainement" ou une autre date'
            : "Aucune salle n'est actuellement occupée"
        }
      />
    );
  }

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={tintColor} /> : undefined
      }>
      <Card>
        {availableRooms.map((room, index) => (
          <Fragment key={`${room.location}-${index}`}>
            {index > 0 && <CardSeparator />}
            <Row
              title={room.location}
              subtitle={room.warnings}
              subtitleColor={errorColor}
              onPress={() => handleRoomPress(room)}
              rightIsInteractive={false}
              right={
                room.timeData ? (
                  <View style={styles.timeInfo}>
                    <ThemedText style={styles.timeText}>{formatRelativeAvailability(room.timeData)}</ThemedText>
                    <ThemedText type="caption" style={{ color: tintColor }}>
                      {room.roomEvents?.length || 0} événements
                    </ThemedText>
                  </View>
                ) : undefined
              }
            />
          </Fragment>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  timeInfo: {
    alignItems: 'flex-end',
    gap: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
