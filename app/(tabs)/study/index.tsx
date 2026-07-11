import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Fragment, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card, CardSeparator, Row } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing } from '@/constants/theme';
import { useDepartments } from '@/contexts/DepartmentsContext';
import { useTabHaptics } from '@/hooks/use-tab-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Department } from '@/types';

export default function StudyScreen() {
  useTabHaptics();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { departments, toggleFavorite } = useDepartments();

  const iconColor = useThemeColor({}, 'icon');
  const favoriteColor = useThemeColor({}, 'favorite');
  const borderColor = useThemeColor({}, 'border');
  const inputBackgroundColor = useThemeColor({}, 'card');

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

  const handleToggleFavorite = (departmentId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(departmentId);
  };

  // Chip and Row already fire their own haptic on press.
  const toggleFavoritesFilter = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  const handleDepartmentPress = (department: Department) => {
    router.push({ pathname: '/study/[departmentId]', params: { departmentId: department.id } });
  };

  const handleClearSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery('');
  };

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic">
      <View style={[styles.searchInputContainer, { backgroundColor: inputBackgroundColor, borderColor }]}>
        <IconSymbol name="magnifyingglass" size={20} color={iconColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: iconColor }]}
          placeholder="Search buildings..."
          placeholderTextColor={iconColor + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            style={styles.clearButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Clear search">
            <IconSymbol name="xmark.circle.fill" size={20} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        <Chip
          label="Favorites Only"
          selected={showFavoritesOnly}
          onPress={toggleFavoritesFilter}
          icon={<IconSymbol name="heart.fill" size={16} color={showFavoritesOnly ? '#ffffff' : iconColor} />}
        />
        <ThemedText type="caption">
          {filteredDepartments.length} building{filteredDepartments.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      {filteredDepartments.length === 0 ? (
        <EmptyState
          icon="graduationcap"
          title={showFavoritesOnly ? 'No favorite buildings yet' : 'No buildings found'}
          subtitle={
            showFavoritesOnly
              ? 'Add buildings to favorites by tapping the heart icon'
              : 'Try adjusting your search terms'
          }
        />
      ) : (
        <Card>
          {filteredDepartments.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && <CardSeparator />}
              <Row
                title={item.name}
                titleNumberOfLines={2}
                onPress={() => handleDepartmentPress(item)}
                right={
                  <TouchableOpacity
                    onPress={() => handleToggleFavorite(item.id)}
                    style={styles.favoriteButton}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                    <IconSymbol
                      name={item.isFavorite ? 'heart.fill' : 'heart'}
                      size={22}
                      color={item.isFavorite ? favoriteColor : iconColor}
                    />
                  </TouchableOpacity>
                }
              />
            </Fragment>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.xl,
    paddingBottom: 40,
    gap: Spacing.lg,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: Spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteButton: {
    padding: 4,
  },
});
