import { Card, CardSeparator, Row } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
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
  selectedDate: Date;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

function formatDuration(totalMinutes: number): string {
  const minutes = Math.max(totalMinutes, 0);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h${String(remainder).padStart(2, '0')}`;
}

/**
 * A direction-explicit availability label: "< {duration}" for a room that's free now
 * (counting down to when it'll next be occupied), "dans {duration}" for a room that's
 * occupied now (counting down to when it'll be free). Which tab you're looking at
 * (Maintenant/Prochainement) already establishes "free" vs "busy", so the label only needs
 * to carry the countdown and its direction, not repeat "Libre" every row.
 * `referenceNow` must be the same reference moment `calculateAvailability` used to compute
 * `timeData` (today's real time for today, or that time-of-day projected onto another date) —
 * otherwise a past/future date's `timeData` gets compared against the wrong "now".
 */
function formatAvailability(timeString: string | undefined, referenceNow: Date, isFreeNow: boolean) {
  if (!timeString) return '';

  const endOfDay = new Date(referenceNow);
  endOfDay.setHours(23, 59, 59, 999);

  const target = new Date(timeString);
  if (target.getTime() >= endOfDay.getTime()) {
    return 'Libre';
  }

  const diffMinutes = Math.round((target.getTime() - referenceNow.getTime()) / 60000);
  const duration = formatDuration(diffMinutes);
  return isFreeNow ? `< ${duration}` : `dans ${duration}`;
}

export default function RoomsList({ rooms, now, department, selectedDate, isRefreshing = false, onRefresh }: RoomsListProps) {
  // `selectedDate` already carries the exact reference moment (live "now" or a user-picked
  // date/time) that `calculateAvailability`/`computeAvailability` used to derive `timeData`.
  const referenceNow = selectedDate;
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
                    <ThemedText style={styles.timeText}>{formatAvailability(room.timeData, referenceNow, now)}</ThemedText>
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
