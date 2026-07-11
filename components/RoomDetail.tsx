import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cleanDescription } from '@/services/DepartmentService';
import { Room, RoomEvent } from '@/types';
import { formatShortWeekdayDate, formatTime } from '@/utils/date-format';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RoomDetailProps {
  room: Room;
}

export default function RoomDetail({ room }: RoomDetailProps) {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: 'rgba(255,255,255,0.1)' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,0.1)', dark: 'rgba(255,255,255,0.15)' }, 'background');
  const errorColor = useThemeColor({}, 'error');
  const infoColor = useThemeColor({}, 'info');

  const formatEventTime = (dateString: string) => formatTime(new Date(dateString));

  const formatEventDate = (dateString: string) => formatShortWeekdayDate(new Date(dateString));

  const renderEventItem = ({ item }: { item: RoomEvent }) => (
    <Card style={[styles.eventItem, { backgroundColor, borderColor }]}>
      <View style={styles.eventHeader}>
        <ThemedText type="defaultSemiBold" numberOfLines={2}>
          {item.summary}
        </ThemedText>
        <ThemedText type="caption" style={styles.eventDate}>
          {formatEventDate(item.start)}
        </ThemedText>
      </View>

      <ThemedText style={[styles.eventTime, { color: infoColor }]}>
        {formatEventTime(item.start)} - {formatEventTime(item.end)}
      </ThemedText>

      {item.description && (
        <ThemedText style={styles.eventDescription} numberOfLines={3}>
          {cleanDescription(item.description)}
        </ThemedText>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Room hero */}
      <View style={[styles.heroSection, Platform.OS === 'ios' && { paddingTop: insets.top + 52 }]}>
        <Card style={styles.heroCard}>
          <ThemedText type="title" style={styles.heroTitle}>
            {room.location}
          </ThemedText>

          {room.warnings && (
            <ThemedText type="caption" style={{ color: errorColor }}>
              {room.warnings}
            </ThemedText>
          )}

          {room.typeDescription && (
            <ThemedText type="caption">
              {room.typeDescription}
            </ThemedText>
          )}
        </Card>
      </View>

      {/* Events List */}
      <View style={styles.eventsContainer}>
        <ThemedText type="subtitle" style={styles.eventsTitle}>
          Événements ({room.roomEvents?.length || 0})
        </ThemedText>

        {(!room.roomEvents || room.roomEvents.length === 0) ? (
          <EmptyState
            icon="checkmark.circle.fill"
            title="Aucun événement planifié pour cette salle"
          />
        ) : (
          <FlatList
            data={room.roomEvents}
            renderItem={renderEventItem}
            keyExtractor={(item, index) => `${item.start}-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.eventsList}
            ItemSeparatorComponent={() => <View style={styles.eventSeparator} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  heroCard: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  heroTitle: {
    fontSize: 24,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventsTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  eventsList: {
    paddingBottom: 40,
  },
  eventItem: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    gap: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  eventDate: {
    textAlign: 'right',
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  eventSeparator: {
    height: 12,
  },
});
