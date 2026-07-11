import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Chip } from '@/components/ui/chip';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DepartmentService } from '@/services/DepartmentService';
import { Department } from '@/types';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const navigation = useNavigation();

  const [selectedView, setSelectedView] = useState(0); // 0: Now, 1: Later
  const [selectedFilter, setSelectedFilter] = useState('Toutes');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
  useLayoutEffect(() => {
    navigation.setOptions({
      title: department.name,
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleFavoritePress} activeOpacity={0.7}>
            <IconSymbol
              name={department.isFavorite ? 'heart.fill' : 'heart'}
              size={24}
              color={department.isFavorite ? favoriteColor : iconColor}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFilterToggle} activeOpacity={0.7}>
            <IconSymbol name="line.3.horizontal.decrease.circle" size={22} color={iconColor} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, department.name, department.isFavorite, iconColor, favoriteColor, handleFavoritePress, handleFilterToggle]);

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
  
  // Run data download task
  const runDataTask = useCallback(async () => {
    const downloadKey = `${department.id}-${selectedDate.toDateString()}`;
    
    // Skip if we've already attempted a download for this department/date combination
    // (regardless of success) — otherwise a failed fetch (offline, server error) retries every render.
    if (lastDownloadKey === downloadKey) {
      return;
    }
    
    setIsLoading(true);
    setDownloadSuccess(false);
    
    try {
      // Check if data needs to be downloaded
      if (DepartmentService.shouldDownloadData(department)) {
        const updatedDepartment = await DepartmentService.downloadICalData(department, selectedDate);
        onDepartmentUpdate(updatedDepartment);
        setDownloadSuccess(updatedDepartment.downloadSuccess || false);
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
      console.error('Error in runDataTask:', error);
      setDownloadSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [department, selectedDate, onDepartmentUpdate, lastDownloadKey]);

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
      // Trigger data reload with new date
      setDownloadSuccess(false);
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
    runDataTask();
  }, [runDataTask]);

  // Reset download status and key when department or date changes
  useEffect(() => {
    setDownloadSuccess(false);
    setLastDownloadKey('');
  }, [department.id, selectedDate]);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        {/* Date Selector */}
        <ThemedView style={styles.dateContainer}>
          <ThemedText style={styles.dateLabel}>Date sélectionnée:</ThemedText>
          <TouchableOpacity
            onPress={handleDatePress}
            style={[styles.dateButton, { backgroundColor, borderColor }]}
            activeOpacity={0.7}>
            <IconSymbol name="calendar" size={20} color={iconColor} />
            <ThemedText style={styles.dateText}>
              {formatSelectedDate(selectedDate)}
            </ThemedText>
            <IconSymbol name="chevron.down" size={16} color={iconColor} />
          </TouchableOpacity>
          
          {/* Quick Date Options */}
          <ThemedView style={styles.quickDateOptions}>
            <TouchableOpacity
              onPress={() => {
                setSelectedDate(new Date());
                setDownloadSuccess(false);
              }}
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
                setDownloadSuccess(false);
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
          </ThemedView>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="inline"
              onChange={handleDateChange}
              maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
              minimumDate={new Date()} // Today
              style={styles.datePicker}
            />
          )}
        </ThemedView>

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
          />
        ) : (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={styles.loadingText}>
              {isLoading ? 'Téléchargement des données...' : 'Préparation...'}
            </ThemedText>
          </ThemedView>
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 4,
  },
  filterContainer: {
    marginTop: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  dateContainer: {
    marginTop: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.7,
  },
  quickDateOptions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  quickDateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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