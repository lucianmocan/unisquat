import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { RoomsListSkeleton } from '@/components/ui/skeleton';
import { Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { resolveIOSPickerLocale } from '@/i18n';
import { DepartmentService } from '@/services/DepartmentService';
import { haptics, NotificationFeedbackType } from '@/services/haptics';
import { Department } from '@/types';
import { formatShortDate, formatTime } from '@/utils/date-format';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RoomsList from './RoomsList';

interface DepartmentDetailProps {
  department: Department;
  onFavoriteToggle: (departmentId: number) => void;
  onDepartmentUpdate: (department: Department) => void;
}

// Internal sentinel — never displayed directly. The "All room types" Chip's actual label is
// `t('common.all')`, resolved at render time so it's translated; every other option comes from
// `department.roomLabels` (real French room-category data), which stays untranslated.
const ALL_ROOM_TYPES = '__ALL__';

export default function DepartmentDetail({
  department,
  onFavoriteToggle,
  onDepartmentUpdate
}: DepartmentDetailProps) {
  const { t } = useTranslation();
  const [selectedView, setSelectedView] = useState(0); // 0: Now, 1: Later
  const [selectedFilter, setSelectedFilter] = useState(ALL_ROOM_TYPES);
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
  const { settings } = useSettings();

  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const favoriteColor = useThemeColor({}, 'favorite');
  const backgroundColor = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: 'rgba(255,255,255,0.1)' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,0.1)', dark: 'rgba(255,255,255,0.15)' }, 'background');
  const isFilterActive = selectedFilter !== ALL_ROOM_TYPES;
  // iOS's compact DateTimePicker is an in-app UIDatePicker, so it can be told which locale to
  // render in; Android's is a system dialog with no such override (see i18n/languages.ts).
  const iosPickerLocale = useMemo(() => resolveIOSPickerLocale(settings.language), [settings.language]);

  const handleFavoritePress = useCallback(() => {
    haptics.impact();
    onFavoriteToggle(department.id);
  }, [department.id, onFavoriteToggle]);

  const handleFilterToggle = useCallback(() => {
    haptics.impact();
    setIsPickerVisible(prev => !prev);
  }, []);

  // Re-bucket rooms against `selectedDate` — ticked live below when the user hasn't picked a
  // specific moment — without waiting for a network refresh, so a room whose class just
  // started moves out of "Now" on its own.
  const roomsWithFreshAvailability = useMemo(() => {
    return department.rooms ? DepartmentService.computeAvailability(department.rooms, selectedDate) : [];
  }, [department.rooms, selectedDate]);

  // Filter rooms based on selected filter
  const filteredRooms = useMemo(() => {
    if (selectedFilter === ALL_ROOM_TYPES) {
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
      // Only signal the outcome for an explicit refresh (pull-to-refresh, error retry) — the
      // initial silent load on screen-open shouldn't buzz the phone.
      if (force) {
        haptics.notification(success ? NotificationFeedbackType.Success : NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Error fetching department data:', error);
      setDownloadSuccess(false);
      setHasError(true);
      if (force) {
        haptics.notification(NotificationFeedbackType.Error);
      }
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
    return [ALL_ROOM_TYPES, ...types];
  }, [department.roomLabels]);

  // SegmentedControl and Chip already fire their own haptic on change/press.
  const handleViewChange = (view: number) => {
    setSelectedView(view);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    if (settings.autoCollapseDepartmentFilters) {
      setIsPickerVisible(false);
    }
  };

  const handleOpenDatePicker = () => {
    haptics.impact();
    setShowDatePicker(true);
  };

  const handleOpenTimePicker = () => {
    haptics.impact();
    setShowTimePicker(true);
  };

  // Picking any part of the date/time control freezes it there — see `isLive` above.
  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      setIsLive(false);
      setSelectedDate(date);
    }
  };

  const handleResetToNow = useCallback(() => {
    haptics.impact();
    setIsLive(true);
    setSelectedDate(new Date());
  }, []);

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

  // While live, re-tick `selectedDate` every second so the displayed clock never visibly lags
  // behind the device's real clock, and any Now/Later boundary crossing is
  // picked up almost immediately. Also re-ticks right away when the app returns to the
  // foreground, so a device clock change made while backgrounded is picked up instantly rather
  // than waiting for the next tick.
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => setSelectedDate(new Date()), 1000);

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        setSelectedDate(new Date());
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [isLive]);

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
              accessibilityLabel={department.isFavorite ? t('departmentDetail.removeFromFavoritesA11y') : t('departmentDetail.addToFavoritesA11y')}>
              <IconSymbol
                name={department.isFavorite ? 'heart.fill' : 'heart'}
                size={24}
                color={department.isFavorite ? favoriteColor : iconColor}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.heroActions}>
            <View style={styles.dateGroup}>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={selectedDate}
                  mode="datetime"
                  display="compact"
                  onChange={handleDateChange}
                  locale={iosPickerLocale}
                  // Without this, the compact toggle's label can render in UTC while the
                  // expanded wheel uses the device's actual calendar/timezone — same instant,
                  // two different-looking times.
                  timeZoneName={Intl.DateTimeFormat().resolvedOptions().timeZone}
                  maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
                  // The compact style bakes in its own leading padding — pull it back so the
                  // control sits flush now that there's no label to its left.
                  style={styles.iosDatePicker}
                />
              ) : (
                <>
                  <TouchableOpacity
                    onPress={handleOpenDatePicker}
                    style={[styles.androidDateButton, { backgroundColor, borderColor }]}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('departmentDetail.chooseDateA11y')}>
                    <IconSymbol name="calendar" size={16} color={iconColor} />
                    <ThemedText style={styles.pickerText}>{formatShortDate(selectedDate)}</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleOpenTimePicker}
                    style={[styles.androidDateButton, { backgroundColor, borderColor }]}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('departmentDetail.chooseTimeA11y')}>
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
              {!isLive && (
                <TouchableOpacity
                  onPress={handleResetToNow}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={t('departmentDetail.resetToNowA11y')}>
                  <IconSymbol name="arrow.clockwise" size={18} color={tintColor} />
                </TouchableOpacity>
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
              accessibilityLabel={t('departmentDetail.filterByRoomTypeA11y')}
              accessibilityState={{ selected: isFilterActive }}>
              <IconSymbol
                name="line.3.horizontal.decrease.circle"
                size={16}
                color={isFilterActive ? '#ffffff' : iconColor}
              />
              <ThemedText style={[styles.pickerText, isFilterActive && { color: '#ffffff' }]}>{t('departmentDetail.filter')}</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Room Type Filter */}
          {isPickerVisible && (
            <View style={styles.filterContainer}>
              <ThemedText style={styles.filterLabel}>{t('departmentDetail.chooseRoomType')}</ThemedText>
              <View style={styles.filterOptions}>
                {roomTypeOptions.map((option) => (
                  <Chip
                    key={option}
                    label={option === ALL_ROOM_TYPES ? t('common.all') : option}
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
          options={[t('departmentDetail.now'), t('departmentDetail.later')]}
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
            title={t('departmentDetail.loadErrorTitle')}
            subtitle={t('departmentDetail.loadErrorSubtitle')}
            actionLabel={t('departmentDetail.retry')}
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
  iosDatePicker: {
    marginLeft: -14,
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
