import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Room } from '@/types';
import { StyleSheet } from 'react-native';

interface RoomRowProps {
  room: Room;
}

export default function RoomRow({ room }: RoomRowProps) {
  const errorColor = useThemeColor({}, 'error');
  const warningColor = useThemeColor({}, 'warning');

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    
    // If it's end of day, show "la fermeture"
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const time = new Date(timeString);
    if (time.getTime() >= endOfDay.getTime()) {
      return 'la fermeture';
    }
    
    // Format as HH:mm
    return time.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.leftSection}>
        <ThemedText type="defaultSemiBold" style={styles.roomName}>
          {room.location}
        </ThemedText>
        {room.warnings && (
          <ThemedText type="caption" style={{ color: errorColor }}>
            {room.warnings}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.rightSection}>
        {room.timeData && (
          <>
            <ThemedText style={styles.timeText}>
              {formatTime(room.timeData)}
            </ThemedText>
            <ThemedText type="caption" style={[styles.eventsText, { color: warningColor }]}>
              {room.roomEvents?.length || 0} événements
            </ThemedText>
          </>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  leftSection: {
    flex: 1,
    gap: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 120,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 18,
    textAlign: 'right',
  },
  eventsText: {
    textAlign: 'right',
  },
});