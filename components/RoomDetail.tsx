import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cleanDescription } from '@/services/DepartmentService';
import { Room, RoomEvent } from '@/types';
import { FlatList, StyleSheet } from 'react-native';

interface RoomDetailProps {
  room: Room;
}

export default function RoomDetail({ room }: RoomDetailProps) {
  const backgroundColor = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: 'rgba(255,255,255,0.1)' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,0.1)', dark: 'rgba(255,255,255,0.15)' }, 'background');
  const errorColor = useThemeColor({}, 'error');
  const infoColor = useThemeColor({}, 'info');

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const renderEventItem = ({ item }: { item: RoomEvent }) => (
    <ThemedView style={[styles.eventItem, { backgroundColor, borderColor }]}>
      <ThemedView style={styles.eventHeader}>
        <ThemedText type="defaultSemiBold" numberOfLines={2}>
          {item.summary}
        </ThemedText>
        <ThemedText type="caption" style={styles.eventDate}>
          {formatEventDate(item.start)}
        </ThemedText>
      </ThemedView>
      
      <ThemedText style={[styles.eventTime, { color: infoColor }]}>
        {formatEventTime(item.start)} - {formatEventTime(item.end)}
      </ThemedText>
      
      {item.description && (
        <ThemedText style={styles.eventDescription} numberOfLines={3}>
          {cleanDescription(item.description)}
        </ThemedText>
      )}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Room Header */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.roomInfo}>
          <ThemedText type="title" style={styles.roomName}>
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
        </ThemedView>
      </ThemedView>

      {/* Events List */}
      <ThemedView style={styles.eventsContainer}>
        <ThemedText type="subtitle" style={styles.eventsTitle}>
          Événements ({room.roomEvents?.length || 0})
        </ThemedText>
        
        {(!room.roomEvents || room.roomEvents.length === 0) ? (
          <ThemedView style={styles.noEventsContainer}>
            <ThemedText style={styles.noEventsText}>
              Aucun événement planifié pour cette salle
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={room.roomEvents}
            renderItem={renderEventItem}
            keyExtractor={(item, index) => `${item.start}-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.eventsList}
            ItemSeparatorComponent={() => <ThemedView style={styles.eventSeparator} />}
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  roomInfo: {
    gap: 8,
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
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
    borderRadius: 12,
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
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noEventsText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
});