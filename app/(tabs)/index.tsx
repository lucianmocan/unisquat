import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';

// Import the department data
import departmentList from '@/assets/images/departmentList.json';

type Department = {
  name: string;
  id: number;
  isFavorite: boolean;
  roomLabels: Record<string, string>;
  roomNames: Record<string, string[]>;
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [departments, setDepartments] = useState<Department[]>(departmentList);

  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: 'rgba(255,255,255,0.1)' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,0.1)', dark: 'rgba(255,255,255,0.15)' }, 'background');
  const inputBackgroundColor = useThemeColor({ light: '#ffffff', dark: '#2c2c2c' }, 'background');

  // Filter departments based on search query and favorites
  const filteredDepartments = useMemo(() => {
    let filtered = departments;

    if (showFavoritesOnly) {
      filtered = filtered.filter(dept => dept.isFavorite);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [departments, searchQuery, showFavoritesOnly]);

  const toggleFavorite = (departmentId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDepartments(prev =>
      prev.map(dept =>
        dept.id === departmentId
          ? { ...dept, isFavorite: !dept.isFavorite }
          : dept
      )
    );
  };

  const toggleFavoritesFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  const handleDepartmentPress = (department: Department) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to department details
    console.log('Selected department:', department.name);
  };

  const renderDepartmentItem = ({ item }: { item: Department }) => (
    <TouchableOpacity
      style={[styles.departmentItem, { backgroundColor }]}
      onPress={() => handleDepartmentPress(item)}
      activeOpacity={0.7}>

      <View style={styles.departmentContent}>
        <View style={styles.departmentInfo}>
          <ThemedText type="defaultSemiBold" numberOfLines={2}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.departmentId}>
            ID: {item.id}
          </ThemedText>
        </View>

        <View style={styles.departmentActions}>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            style={styles.favoriteButton}
            activeOpacity={0.7}>
            <Ionicons
              name={item.isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={item.isFavorite ? "#ff4444" : iconColor}
            />
          </TouchableOpacity>

          <Ionicons name="chevron-forward" size={20} color={iconColor} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Search</ThemedText>
        <Ionicons name="school" size={32} color={tintColor} />
      </ThemedView>

      <ThemedView style={styles.subtitle}>
        <ThemedText type="subtitle">Find Your Study Space</ThemedText>
      </ThemedView>

      {/* Search Bar */}
      <ThemedView style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: inputBackgroundColor, borderColor }]}>
          <Ionicons name="search" size={20} color={iconColor} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: iconColor }]}
            placeholder="Search buildings..."
            placeholderTextColor={iconColor + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              activeOpacity={0.7}>
              <Ionicons name="close-circle" size={20} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>

      {/* Filter Buttons */}
      <ThemedView style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: showFavoritesOnly ? tintColor : backgroundColor}
          ]}
          onPress={toggleFavoritesFilter}
          activeOpacity={0.7}>
          <Ionicons
            name="heart"
            size={16}
            color={showFavoritesOnly ? '#ffffff' : iconColor}
          />
          <ThemedText
            style={[
              styles.filterButtonText,
              { color: showFavoritesOnly ? '#ffffff' : iconColor }
            ]}>
            Favorites Only
          </ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.resultsCount}>
          {filteredDepartments.length} building{filteredDepartments.length !== 1 ? 's' : ''}
        </ThemedText>
      </ThemedView>

      {/* Buildings List */}
      <ThemedView style={styles.listContainer}>
        {filteredDepartments.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Ionicons name="school-outline" size={64} color={iconColor + '40'} />
            <ThemedText style={styles.emptyStateText}>
              {showFavoritesOnly ? 'No favorite buildings yet' : 'No buildings found'}
            </ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              {showFavoritesOnly
                ? 'Add buildings to favorites by tapping the heart icon'
                : 'Try adjusting your search terms'
              }
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={filteredDepartments}
            renderItem={renderDepartmentItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  listContainer: {
    flex: 1,
  },
  departmentItem: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  departmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  departmentInfo: {
    flex: 1,
    gap: 4,
  },
  departmentId: {
    fontSize: 12,
    opacity: 0.6,
  },
  departmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favoriteButton: {
    padding: 4,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
