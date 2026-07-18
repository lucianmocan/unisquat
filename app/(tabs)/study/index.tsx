import { router, useNavigation } from "expo-router";
import { Fragment, useLayoutEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Card, CardSeparator, Row } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Radius, Spacing } from "@/constants/theme";
import { useDepartments } from "@/contexts/DepartmentsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useTabHaptics } from "@/hooks/use-tab-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";
import { haptics } from "@/services/haptics";
import { Department } from "@/types";

const ALL_CAMPUSES = "Tous";

export default function StudyScreen() {
  useTabHaptics();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(ALL_CAMPUSES);
  const [isCampusPickerVisible, setIsCampusPickerVisible] = useState(false);
  const { departments, toggleFavorite } = useDepartments();
  const { settings } = useSettings();

  const iconColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");
  const favoriteColor = useThemeColor({}, "favorite");
  const chipBackgroundColor = useThemeColor(
    { light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.1)" },
    "background",
  );
  const isCampusFilterActive = selectedCampus !== ALL_CAMPUSES;

  // Native header search bar (a real UISearchController on iOS) instead of a custom TextInput —
  // options must be set imperatively since headerSearchBarOptions needs to call back into this
  // screen's own state.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search buildings...",
        autoCapitalize: "none",
        onChangeText: (event: { nativeEvent: { text: string } }) =>
          setSearchQuery(event.nativeEvent.text),
      },
    });
  }, [navigation]);

  const campusOptions = useMemo(() => {
    const campuses = Array.from(
      new Set(departments.map((dept) => dept.campus)),
    ).sort();
    return [ALL_CAMPUSES, ...campuses];
  }, [departments]);

  const filteredDepartments = useMemo(() => {
    let filtered = departments;

    if (showFavoritesOnly) {
      filtered = filtered.filter((dept) => dept.isFavorite);
    }

    if (isCampusFilterActive) {
      filtered = filtered.filter((dept) => dept.campus === selectedCampus);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((dept) =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [
    departments,
    searchQuery,
    showFavoritesOnly,
    selectedCampus,
    isCampusFilterActive,
  ]);

  const handleToggleFavorite = (departmentId: number) => {
    haptics.impact();
    toggleFavorite(departmentId);
  };

  // Row and the campus Chip options already fire their own haptic on press.
  const toggleFavoritesFilter = () => {
    haptics.impact();
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  const handleCampusFilterToggle = () => {
    haptics.impact();
    setIsCampusPickerVisible((prev) => !prev);
  };

  const handleCampusChange = (campus: string) => {
    setSelectedCampus(campus);
    if (settings.autoCollapseSearchFilters) {
      setIsCampusPickerVisible(false);
    }
  };

  const handleDepartmentPress = (department: Department) => {
    router.push({
      pathname: "/study/[departmentId]",
      params: { departmentId: department.id },
    });
  };

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={toggleFavoritesFilter}
          style={[
            styles.filterChip,
            {
              backgroundColor: showFavoritesOnly
                ? tintColor
                : chipBackgroundColor,
            },
          ]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Favorites only"
          accessibilityState={{ selected: showFavoritesOnly }}
        >
          <IconSymbol
            name="heart.fill"
            size={16}
            color={showFavoritesOnly ? "#ffffff" : iconColor}
          />
          <ThemedText
            style={[
              styles.filterChipText,
              showFavoritesOnly && { color: "#ffffff" },
            ]}
          >
            Favorites
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCampusFilterToggle}
          style={[
            styles.filterChip,
            {
              backgroundColor: isCampusFilterActive
                ? tintColor
                : chipBackgroundColor,
            },
          ]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Filter by campus"
          accessibilityState={{ selected: isCampusFilterActive }}
        >
          <IconSymbol
            name="line.3.horizontal.decrease.circle"
            size={16}
            color={isCampusFilterActive ? "#ffffff" : iconColor}
          />
          <ThemedText
            style={[
              styles.filterChipText,
              isCampusFilterActive && { color: "#ffffff" },
            ]}
          >
            {isCampusFilterActive ? selectedCampus : "Filtrer"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {isCampusPickerVisible && (
        <View style={styles.campusFilterContainer}>
          <ThemedText style={styles.campusFilterLabel}>
            Choisir un campus:
          </ThemedText>
          <View style={styles.campusFilterOptions}>
            {campusOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={selectedCampus === option}
                onPress={() => handleCampusChange(option)}
              />
            ))}
          </View>
        </View>
      )}

      {filteredDepartments.length === 0 ? (
        <EmptyState
          icon="graduationcap"
          title={
            showFavoritesOnly
              ? "No favorite buildings yet"
              : "No buildings found"
          }
          subtitle={
            showFavoritesOnly
              ? "Add buildings to favorites by tapping the heart icon"
              : "Try adjusting your search or filters"
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
                    accessibilityLabel={
                      item.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <IconSymbol
                      name={item.isFavorite ? "heart.fill" : "heart"}
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: 40,
    gap: Spacing.lg,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  filterChipText: {
    fontSize: 17,
  },
  campusFilterContainer: {
    gap: 12,
  },
  campusFilterLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  campusFilterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  favoriteButton: {
    padding: 4,
  },
});
