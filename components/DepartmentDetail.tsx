import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { RoomsListSkeleton } from '@/components/ui/skeleton';
import { Radius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DepartmentService } from '@/services/DepartmentService';
import { Department } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const [showDatePicker, setShowDatePicker] = useState(false);

  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const favoriteColor = useThemeColor({}, 'favorite');
  const backgroundColor = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: 'rgba(255,255,255,0.1)' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,0.1)', dark: 'rgba(255,255,255,0.15)' }, 'background');

  const handleFavoritePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoriteToggle(department.id);
  }, [department.id, onFavoriteToggle]);

  const handleFilterToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPickerVisible(prev => !prev);
  }, []);

  // Native header: title + favorite/filter toolbar buttons, matching the Swift app's nav bar
  const renderHeaderRight = useCallback(
    () => (
      <View style={styles.headerButtons}>
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
        <TouchableOpacity
          onPress={handleFilterToggle}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Filter by room type">
          <IconSymbol name="line.3.horizontal.decrease.circle" size={22} color={iconColor} />
        </TouchableOpacity>
      </View>
    ),
    [department.isFavorite, iconColor, favoriteColor, handleFavoritePress, handleFilterToggle]
  );

  // Filter rooms based on selected filter
  const filteredRooms = useMemo(() => {
    if (!department.rooms) {
      return [];
    }
    if (selectedFilter === 'Toutes') {
      return department.rooms;
    }
    return department.rooms.filter(room => room.typeDescription === selectedFilter);
  }, [department, selectedFilter]);

  // Track if we've already downloaded data for this department/date combination
  const [lastDownloadKey, setLastDownloadKey] = useState<string>('');

  // Fetch (or recompute) room data. `force` bypasses the 30-min cache and the
  // already-attempted guard — used for pull-to-refresh and the error retry button.
  const fetchData = useCallback(async (force: boolean) => {
    const downloadKey = `${department.id}-${selectedDate.toDateString()}`;

    // Skip if we've already attempted a download for this department/date combination
    // (regardless of success) — otherwise a failed fetch (offline, server error) retries every render.
    if (!force && lastDownloadKey === downloadKey) {
      return;
    }

    setIsRefreshing(force);
    setDownloadSuccess(false);
    setHasError(false);

    try {
      if (force || DepartmentService.shouldDownloadData(department)) {
        const updatedDepartment = await DepartmentService.downloadICalData(department, selectedDate);
        onDepartmentUpdate(updatedDepartment);
        const success = updatedDepartment.downloadSuccess || false;
        setDownloadSuccess(success);
        setHasError(!success);
        setLastDownloadKey(downloadKey);
      } else {
        // Data is already fresh, just calculate availability
        DepartmentService.calculateAvailability(department);
        // Update the component with the recalculated department
        onDepartmentUpdate({ ...department });
        setDownloadSuccess(true);
        setLastDownloadKey(downloadKey);
      }
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

  const handleDatePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDatePicker(prev => !prev);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Download and process iCal data when component mounts or department/date changes
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Reset download status and key when department or date changes
  useEffect(() => {
    setDownloadSuccess(false);
    setHasError(false);
    setLastDownloadKey('');
  }, [department.id, selectedDate]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: department.name, headerRight: renderHeaderRight }} />
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity
          onPress={handleDatePress}
          style={[styles.dateButton, { backgroundColor, borderColor }]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Choose a date">
          <IconSymbol name="calendar" size={20} color={iconColor} />
          <ThemedText style={styles.dateText}>
            {formatSelectedDate(selectedDate)}
          </ThemedText>
          <IconSymbol name="chevron.down" size={16} color={iconColor} />
        </TouchableOpacity>

        {/* Room Type Filter */}
        {isPickerVisible && (
          <ThemedView style={styles.filterContainer}>
            <ThemedText style={styles.filterLabel}>Choisir un type de salle:</ThemedText>
            <ThemedView style={styles.filterOptions}>
              {roomTypeOptions.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  selected={selectedFilter === option}
                  onPress={() => handleFilterChange(option)}
                />
              ))}
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>

      {/* Time Period Selector */}
      <ThemedView style={styles.timeSelectorContainer}>
        <SegmentedControl
          options={['Maintenant', 'Prochainement']}
          selectedIndex={selectedView}
          onChange={handleViewChange}
        />

        {/* Column Headers */}
        <ThemedView style={styles.columnHeaders}>
          <ThemedText style={styles.columnHeader}>Salle :</ThemedText>
          <ThemedText style={styles.columnHeader}>
            {selectedView === 0 ? 'Disponible jusqu\'à :' : 'Disponible à partir de:'}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Content */}
      <ThemedView style={styles.content}>
        {downloadSuccess ? (
          <RoomsList
            rooms={filteredRooms}
            now={selectedView === 0}
            department={department}
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
      </ThemedView>

      {/* Date Picker — a sheet overlay so opening it doesn't reflow the screen behind it */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.datePickerOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDatePicker(false)} />
          <ThemedView style={styles.datePickerSheet}>
            <View style={styles.datePickerHeader}>
              <ThemedText type="defaultSemiBold">Sélectionner une date</ThemedText>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                accessibilityRole="button"
                accessibilityLabel="Done">
                <ThemedText type="link">Terminé</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.quickDateOptions}>
              <TouchableOpacity
                onPress={() => setSelectedDate(new Date())}
                style={[
                  styles.quickDateButton,
                  {
                    backgroundColor: selectedDate.toDateString() === new Date().toDateString() ? tintColor : backgroundColor,
                    borderColor,
                  }
                ]}
                activeOpacity={0.7}>
                <ThemedText
                  style={[
                    styles.quickDateText,
                    { color: selectedDate.toDateString() === new Date().toDateString() ? '#ffffff' : iconColor }
                  ]}>
                  Aujourd&apos;hui
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow);
                }}
                style={[
                  styles.quickDateButton,
                  {
                    backgroundColor: selectedDate.toDateString() === new Date(Date.now() + 86400000).toDateString() ? tintColor : backgroundColor,
                    borderColor,
                  }
                ]}
                activeOpacity={0.7}>
                <ThemedText
                  style={[
                    styles.quickDateText,
                    { color: selectedDate.toDateString() === new Date(Date.now() + 86400000).toDateString() ? '#ffffff' : iconColor }
                  ]}>
                  Demain
                </ThemedText>
              </TouchableOpacity>
            </View>

            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="inline"
              onChange={handleDateChange}
              maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
              style={styles.datePicker}
            />
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 4,
  },
  filterContainer: {
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
  columnHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  columnHeader: {
    fontSize: 14,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  datePickerSheet: {
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
    padding: 20,
    paddingBottom: 32,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickDateOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickDateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  datePicker: {
    width: '100%',
  },
});