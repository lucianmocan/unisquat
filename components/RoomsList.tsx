import { Card, CardSeparator, Row } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Department, Room } from '@/types';
import { router } from 'expo-router';
import { TFunction } from 'i18next';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
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

function formatDuration(totalMinutes: number, t: TFunction): string {
  const minutes = Math.max(totalMinutes, 0);
  if (minutes < 60) return t('roomsList.minutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0
    ? t('roomsList.hours', { count: hours })
    : t('roomsList.hoursMinutes', { hours, minutes: String(remainder).padStart(2, '0') });
}

/**
 * A direction-explicit availability label: "< {duration}" for a room that's free now
 * (counting down to when it'll next be occupied), "in {duration}" for a room that's
 * occupied now (counting down to when it'll be free). Which tab you're looking at
 * (Now/Later) already establishes "free" vs "busy", so the label only needs to carry the
 * countdown and its direction, not repeat "Free" every row.
 * `referenceNow` must be the same reference moment `calculateAvailability` used to compute
 * `timeData` (today's real time for today, or that time-of-day projected onto another date) —
 * otherwise a past/future date's `timeData` gets compared against the wrong "now".
 */
function formatAvailability(timeString: string | undefined, referenceNow: Date, isFreeNow: boolean, t: TFunction) {
  if (!timeString) return '';

  const endOfDay = new Date(referenceNow);
  endOfDay.setHours(23, 59, 59, 999);

  const target = new Date(timeString);
  if (target.getTime() >= endOfDay.getTime()) {
    return t('roomsList.free');
  }

  // Floor, not round — a countdown should never claim more time remains than actually does
  // (rounding up would show e.g. "3h06" when only 3h05m20s is genuinely left).
  const diffMinutes = Math.floor((target.getTime() - referenceNow.getTime()) / 60000);
  const duration = formatDuration(diffMinutes, t);
  return isFreeNow ? t('roomsList.busyIn', { duration }) : t('roomsList.freeIn', { duration });
}

export default function RoomsList({ rooms, now, department, selectedDate, isRefreshing = false, onRefresh }: RoomsListProps) {
  const { t } = useTranslation();
  // `selectedDate` already carries the exact reference moment (live "now" or a user-picked
  // date/time) that `calculateAvailability`/`computeAvailability` used to derive `timeData`.
  const referenceNow = selectedDate;
  const tintColor = useThemeColor({}, 'tint');
  const insets = useSafeAreaInsets();

  // "Now" shows rooms currently free; "Later" shows rooms currently occupied
  const availableRooms = rooms.filter(room => room.isFree === now);

  const handleRoomPress = (room: Room) => {
    router.push({
      pathname: '/study/[departmentId]/room/[roomId]',
      params: { departmentId: department.id, roomId: room.location, referenceDate: referenceNow.toISOString() },
    });
  };

  if (availableRooms.length === 0) {
    return (
      <EmptyState
        icon={now ? 'magnifyingglass' : 'checkmark.circle.fill'}
        title={now ? t('roomsList.noFreeRoomsFound') : t('roomsList.allRoomsFree')}
        subtitle={now ? t('roomsList.tryLaterOrOtherDate') : t('roomsList.noRoomsOccupied')}
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
              onPress={() => handleRoomPress(room)}
              rightIsInteractive={false}
              right={
                room.timeData ? (
                  <View style={styles.timeInfo}>
                    <ThemedText style={styles.timeText}>{formatAvailability(room.timeData, referenceNow, now, t)}</ThemedText>
                    <ThemedText type="caption" style={{ color: tintColor }}>
                      {t('roomsList.eventsCount', { count: room.roomEvents?.length || 0 })}
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
