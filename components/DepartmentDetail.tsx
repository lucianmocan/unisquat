import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { RoomsListSkeleton } from '@/components/ui/skeleton';
import { Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DepartmentService } from '@/services/DepartmentService';
import { Department } from '@/types';
import { formatShortDate, formatTime } from '@/utils/date-format';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RoomsList from './RoomsList';

interface DepartmentDetailProps {
  department: Department;
  onFavoriteToggle: (departmentId: number) => void;
  onDepartmentUpdate: (department: Department) => void;
}

export default function DepartmentDetail({
  department,
  onFavoriteToggle,
  onDepartmentUpdate
}: DepartmentDetailProps) {
  const [selectedView, setSelectedView] = useState(0); // 0: Now, 1: Later
  const [selectedFilter, setSelectedFilter] = useState('Toutes');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false); // Android only — iOS's compact picker manages its own popover
  const [showTimePicker, setShowTimePicker] = useState(false); // Android only
  // Whether `selectedDate` should keep tracking the real current moment. Turns off the instant
  // the user manually picks a date/time — at that point they've chosen a specific moment to
  // inspect, and ticking it forward would fight their selection.
  const [isLive, setIsLive] = useState(true);
  const insets = useSafeAreaInsets();

  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const favoriteColor = useThemeColor({}, 'favorite');
  const backgroundColor = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: 'rgba(255,255,255,0.1)' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,0.1)', dark: 'rgba(255,255,255,0.15)' }, 'background');
  const isFilterActive = selectedFilter !== 'Toutes';

  const handleFavoritePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoriteToggle(department.id);
  }, [department.id, onFavoriteToggle]);

  const handleFilterToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPickerVisible(prev => !prev);
  }, []);

  // Re-bucket rooms against `selectedDate` — ticked live below when the user hasn't picked a
  // specific moment — without waiting for a network refresh, so a room whose class just
  // started moves out of "Maintenant" on its own.
  const roomsWithFreshAvailability = useMemo(() => {
    return department.rooms ? DepartmentService.computeAvailability(department.rooms, selectedDate) : [];
  }, [department.rooms, selectedDate]);

  // Filter rooms based on selected filter
  const filteredRooms = useMemo(() => {
    if (selectedFilter === 'Toutes') {
      return roomsWithFreshAvailability;
    }
    return roomsWithFreshAvailability.filter(room => room.typeDescription === selectedFilter);
  }, [roomsWithFreshAvailability, selectedFilter]);

  // Track if we've already downloaded data for this department/date combination
  const [lastDownloadKey, setLastDownloadKey] = useState<string>('');

  // Fetch room data for the selected date. `force` bypasses the already-attempted guard
  // (used for pull-to-refresh and the error retry button). Once we're past that guard we
  // always download — `department.ical`/`downloadTime` only ever hold one date's worth of
  // data, so a wall-clock cache check can't tell "still fresh" apart from "fresh, but for
  // the wrong date" (that mismatch was why switching dates silently kept showing stale data).
  const fetchData = useCallback(async (force: boolean) => {
    const downloadKey = `${department.id}-${selectedDate.toDateString()}`;

    // Skip if we've already attempted a download for this department/date combination
    // (regardless of success) — otherwise a failed fetch (offline, server error) retries every render.
    if (!force && lastDownloadKey === downloadKey) {
      return;
    }

    setIsRefreshing(force);
    // A forced refresh (pull-to-refresh, error retry) keeps the existing list mounted —
    // resetting downloadSuccess here would unmount RoomsList into the skeleton mid-gesture,
    // discarding its RefreshControl and making room re-bucketing look like it silently failed.
    if (!force) {
      setDownloadSuccess(false);
    }
    setHasError(false);

    try {
      const updatedDepartment = await DepartmentService.downloadICalData(department, selectedDate);
      onDepartmentUpdate(updatedDepartment);
      const success = updatedDepartment.downloadSuccess || false;
      setDownloadSuccess(success);
      setHasError(!success);
      setLastDownloadKey(downloadKey);
    } catch (error) {
      console.error('Error fetching department data:', error);
      setDownloadSuccess(false);
      setHasError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [department, selectedDate, onDepartmentUpdate, lastDownloadKey]);

  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Get unique room type descriptions for filter
  const roomTypeOptions = useMemo(() => {
    const types = Object.values(department.roomLabels).sort();
    return ['Toutes', ...types];
  }, [department.roomLabels]);

  const handleViewChange = (view: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedView(view);
  };

  const handleFilterChange = (filter: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filter);
  };

  // Picking any part of the date/time control freezes it there — see `isLive` above.
  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      setIsLive(false);
      setSelectedDate(date);
    }
  };

  // Download and process iCal data when component mounts or department/date changes
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Reset download status and key when department or the selected DAY changes. Keyed off the
  // date string rather than the `selectedDate` object so a live tick (which only changes the
  // time-of-day, not the day) doesn't retrigger this — that would unmount RoomsList into the
  // skeleton and force a network refetch every minute for no reason.
  const selectedDateKey = selectedDate.toDateString();
  useEffect(() => {
    setDownloadSuccess(false);
    setHasError(false);
    setLastDownloadKey('');
  }, [department.id, selectedDateKey]);

  // While live, re-tick `selectedDate` exactly when a room's free/busy status could next
  // change (the nearest event start/end), not on a fixed poll — so a countdown crossing zero
  // flips Maintenant/Prochainement right away instead of lagging up to a minute behind. Capped
  // at 60s so countdown labels still refresh even when nothing is imminent. Also re-ticks
  // immediately when the app returns to the foreground, so a device clock change made while
  // backgrounded (or just time passing while backgrounded) is picked up right away.
  useEffect(() => {
    if (!isLive) return;

    let timeout: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const now = new Date();
      const msToBoundary = department.rooms ? DepartmentService.msUntilNextBoundary(department.rooms, now) : null;
      const delay = Math.max(Math.min(msToBoundary ?? 60_000, 60_000), 1000);
      timeout = setTimeout(() => {
        setSelectedDate(new Date());
        scheduleNext();
      }, delay);
    };
    scheduleNext();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        setSelectedDate(new Date());
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [isLive, department.rooms]);

  return (
    <View style={styles.container}>
      {/* Hero card — no title in the native header, just the back button */}
      <View style={[styles.heroSection, Platform.OS === 'ios' && { paddingTop: insets.top + 68 }]}>
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <ThemedText type="title" style={styles.heroTitle} numberOfLines={2}>
              {department.name}
            </ThemedText>
            <TouchableOpacity
              onPress={handleFavoritePress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={department.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <IconSymbol
                name={department.isFavorite ? 'heart.fill' : 'heart'}
                size={24}
                color={department.isFavorite ? favoriteColor : iconColor}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.heroActions}>
            <View style={styles.dateGroup}>
              <ThemedText style={styles.pickerText}>Date :</ThemedText>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={selectedDate}
                  mode="datetime"
                  display="compact"
                  onChange={handleDateChange}
                  // Without this, the compact toggle's label can render in UTC while the
                  // expanded wheel uses the device's actual calendar/timezone — same instant,
                  // two different-looking times.
                  timeZoneName={Intl.DateTimeFormat().resolvedOptions().timeZone}
                  maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
                />
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={[styles.androidDateButton, { backgroundColor, borderColor }]}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Choose a date">
                    <IconSymbol name="calendar" size={16} color={iconColor} />
                    <ThemedText style={styles.pickerText}>{formatShortDate(selectedDate)}</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    style={[styles.androidDateButton, { backgroundColor, borderColor }]}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Choose a time">
                    <IconSymbol name="clock" size={16} color={iconColor} />
                    <ThemedText style={styles.pickerText}>{formatTime(selectedDate)}</ThemedText>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={(event, date) => {
                        setShowDatePicker(false);
                        handleDateChange(event, date);
                      }}
                      maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
                    />
                  )}
                  {showTimePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="time"
                      display="default"
                      onChange={(event, date) => {
                        setShowTimePicker(false);
                        handleDateChange(event, date);
                      }}
                    />
                  )}
                </>
              )}
            </View>
            <TouchableOpacity
              onPress={handleFilterToggle}
              style={[
                styles.filterChip,
                { backgroundColor: isFilterActive ? tintColor : backgroundColor },
              ]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Filter by room type"
              accessibilityState={{ selected: isFilterActive }}>
              <IconSymbol
                name="line.3.horizontal.decrease.circle"
                size={16}
                color={isFilterActive ? '#ffffff' : iconColor}
              />
              <ThemedText style={[styles.pickerText, isFilterActive && { color: '#ffffff' }]}>Filtrer</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Room Type Filter */}
          {isPickerVisible && (
            <View style={styles.filterContainer}>
              <ThemedText style={styles.filterLabel}>Choisir un type de salle:</ThemedText>
              <View style={styles.filterOptions}>
                {roomTypeOptions.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    selected={selectedFilter === option}
                    onPress={() => handleFilterChange(option)}
                  />
                ))}
              </View>
            </View>
          )}
        </Card>
      </View>

      {/* Time Period Selector */}
      <View style={styles.timeSelectorContainer}>
        <SegmentedControl
          options={['Maintenant', 'Prochainement']}
          selectedIndex={selectedView}
          onChange={handleViewChange}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {downloadSuccess ? (
          <RoomsList
            rooms={filteredRooms}
            now={selectedView === 0}
            department={department}
            selectedDate={selectedDate}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        ) : hasError ? (
          <EmptyState
            icon="xmark.circle.fill"
            title="Impossible de charger les données"
            subtitle="Vérifiez votre connexion et réessayez"
            actionLabel="Réessayer"
            onAction={handleRefresh}
          />
        ) : (
          <RoomsListSkeleton />
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
    gap: Spacing.sm,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  heroTitle: {
    flex: 1,
    fontSize: 24,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  // Matches the native compact DateTimePicker's own text size (iOS system body, 17pt).
  pickerText: {
    fontSize: 17,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  androidDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  filterContainer: {
    marginTop: Spacing.md,
    gap: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSelectorContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  content: {
    flex: 1,
  },
});
