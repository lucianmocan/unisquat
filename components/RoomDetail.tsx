import { ThemedText } from '@/components/themed-text';
import { Card, CardSeparator } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cleanDescription } from '@/services/DepartmentService';
import { Room, RoomEvent } from '@/types';
import { formatShortWeekdayDate, formatTime } from '@/utils/date-format';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RoomDetailProps {
  room: Room;
  referenceDate: Date;
}

type EventSectionKey = 'past' | 'current' | 'future';

const SECTION_TITLES: Record<EventSectionKey, string> = {
  past: 'Passé',
  current: 'En cours',
  future: 'À venir',
};

type ListRow =
  | { type: 'header'; key: string; label: string; sectionKey: EventSectionKey }
  | { type: 'event'; key: string; event: RoomEvent; status: EventSectionKey };

/**
 * Flattens events into Passé/En cours/À venir groups (an inset-grouped-list layout, iOS
 * Settings-style) as one row array — header rows mark `stickyHeaderIndices` — classified once
 * against `referenceDate`, the moment the picker/live clock held when this screen was opened.
 * Also returns the index of the row to scroll to on open: the current event, or the first
 * future one if nothing's happening right now.
 */
function buildRows(
  events: RoomEvent[],
  referenceDate: Date
): { rows: ListRow[]; stickyHeaderIndices: number[]; targetIndex: number | null } {
  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const nowMs = referenceDate.getTime();

  const grouped: Record<EventSectionKey, RoomEvent[]> = { past: [], current: [], future: [] };
  sorted.forEach(event => {
    const start = new Date(event.start).getTime();
    const end = new Date(event.end).getTime();
    const key: EventSectionKey = nowMs >= end ? 'past' : nowMs >= start ? 'current' : 'future';
    grouped[key].push(event);
  });

  const rows: ListRow[] = [];
  const stickyHeaderIndices: number[] = [];
  let targetIndex: number | null = null;

  (['past', 'current', 'future'] as EventSectionKey[]).forEach(key => {
    const groupEvents = grouped[key];
    if (groupEvents.length === 0) return;

    stickyHeaderIndices.push(rows.length);
    rows.push({ type: 'header', key: `header-${key}`, label: SECTION_TITLES[key], sectionKey: key });

    groupEvents.forEach(event => {
      if (targetIndex === null && (key === 'current' || key === 'future')) {
        targetIndex = rows.length;
      }
      // Keyed by the row's own position in the final flattened array, not a per-group index —
      // two events sharing a start time can land at the same local index in different groups
      // (past[2] vs future[2]), which produced duplicate keys when the key only used that index.
      rows.push({ type: 'event', key: `event-${rows.length}`, event, status: key });
    });
  });

  return { rows, stickyHeaderIndices, targetIndex };
}

export default function RoomDetail({ room, referenceDate }: RoomDetailProps) {
  const insets = useSafeAreaInsets();
  // iOS system grouped-background gray, used behind the sticky section headers.
  const sectionBackground = useThemeColor({ light: '#F2F2F7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const sectionHeaderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  const events = room.roomEvents ?? [];
  // Classified once, as of the reference moment this screen opened with — not re-ticked while
  // you're looking at it.
  const [{ rows, stickyHeaderIndices, targetIndex }] = useState(() => buildRows(events, referenceDate));
  const listRef = useRef<FlatList<ListRow>>(null);
  // A FlatList row's `onLayout` reports `y` relative to its own cell wrapper, not the
  // scrollable content's origin — there's no direct way to read a row's absolute offset. So
  // instead we measure every row's own height and sum the ones before the target to get its
  // true offset within the list.
  const rowHeights = useRef<(number | null)[]>(new Array(rows.length).fill(null));
  const [listHeight, setListHeight] = useState(0);
  const hasScrolled = useRef(false);

  const formatEventTime = (dateString: string) => formatTime(new Date(dateString));
  const formatEventDate = (dateString: string) => formatShortWeekdayDate(new Date(dateString));

  const tryScroll = useCallback(() => {
    // Wait for the list's own real viewport height (it's shorter than the full screen — the
    // hero card and title sit above it) — using an overestimate here under-scrolls, leaving
    // the target lower than intended.
    if (hasScrolled.current || targetIndex === null || listHeight === 0) return;
    for (let i = 0; i < targetIndex; i++) {
      if (rowHeights.current[i] === null) return;
    }
    hasScrolled.current = true;
    const offsetToTarget = rowHeights.current.slice(0, targetIndex).reduce((sum: number, h) => sum + (h ?? 0), 0);
    const offset = Math.max(offsetToTarget - listHeight * 0.25, 0);
    listRef.current?.scrollToOffset({ offset, animated: false });
  }, [targetIndex, listHeight]);

  // Re-attempt once the list's real height arrives, in case it lands after the rows measure.
  useEffect(() => {
    tryScroll();
  }, [tryScroll]);

  const handleRowLayout = (index: number) => (event: LayoutChangeEvent) => {
    rowHeights.current[index] = event.nativeEvent.layout.height;
    tryScroll();
  };

  const renderItem = ({ item, index }: { item: ListRow; index: number }) => {
    if (item.type === 'header') {
      return (
        <View style={[styles.sectionHeader, { backgroundColor: sectionBackground }]} onLayout={handleRowLayout(index)}>
          <ThemedText
            style={[
              styles.sectionHeaderText,
              { color: item.sectionKey === 'current' ? textColor : sectionHeaderColor },
            ]}>
            {item.label}
          </ThemedText>
        </View>
      );
    }

    const { event, status } = item;
    const isCurrent = status === 'current';
    const isDimmed = status === 'past' || status === 'future';

    return (
      <Card style={[styles.eventCard, isDimmed && styles.dimmedEvent]} onLayout={handleRowLayout(index)}>
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleRow}>
            {isCurrent && <IconSymbol name="clock" size={16} color={tintColor} />}
            <ThemedText
              type="defaultSemiBold"
              numberOfLines={2}
              style={isCurrent ? { color: tintColor } : undefined}>
              {event.summary}
            </ThemedText>
          </View>
          <ThemedText type="caption" style={styles.eventDate}>
            {formatEventDate(event.start)}
          </ThemedText>
        </View>

        {event.description && (
          <ThemedText style={styles.eventDescription} numberOfLines={3}>
            {cleanDescription(event.description)}
          </ThemedText>
        )}

        <View style={styles.eventSeparatorWrap}>
          <CardSeparator inset={0} />
        </View>

        <ThemedText style={[styles.eventTime, { color: tintColor }]}>
          {formatEventTime(event.start)} - {formatEventTime(event.end)}
        </ThemedText>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Room hero */}
      <View style={[styles.heroSection, Platform.OS === 'ios' && { paddingTop: insets.top + 52 }]}>
        <Card style={styles.heroCard}>
          <ThemedText type="title" style={styles.heroTitle}>
            {room.location}
          </ThemedText>

          {room.warnings && <ThemedText type="caption">{room.warnings}</ThemedText>}

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
          Événements ({events.length})
        </ThemedText>

        {events.length === 0 ? (
          <EmptyState
            icon="checkmark.circle.fill"
            title="Aucun événement planifié pour cette salle"
          />
        ) : (
          <FlatList
            ref={listRef}
            data={rows}
            renderItem={renderItem}
            keyExtractor={item => item.key}
            stickyHeaderIndices={stickyHeaderIndices}
            // Render every row up front (lists here are small) so every row's `onLayout` fires
            // immediately — otherwise, with normal virtualization, a target further down than
            // the initial render window wouldn't be measurable until it scrolls into view,
            // which is exactly what we're trying to do in the first place.
            initialNumToRender={rows.length}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
            onLayout={event => setListHeight(event.nativeEvent.layout.height)}
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
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: '600',
  },
  eventCard: {
    padding: 16,
    gap: 8,
    marginBottom: 12,
  },
  dimmedEvent: {
    opacity: 0.55,
  },
  eventSeparatorWrap: {
    marginHorizontal: -16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  eventDate: {
    textAlign: 'right',
  },
  eventTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});
