import { router, useNavigation } from "expo-router";
import { Fragment, useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Card, CardSeparator, Row } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Radius, Spacing, TAB_BAR_CLEARANCE } from "@/constants/theme";
import { useDepartments } from "@/contexts/DepartmentsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useTabHaptics } from "@/hooks/use-tab-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";
import { haptics } from "@/services/haptics";
import { Department } from "@/types";

// Internal sentinel — never displayed directly. The "All campuses" Chip's actual label is
// `t('common.all')`, resolved at render time so it's translated; every other campus option is
// real department data (French building/campus names), which stays untranslated.
const ALL_CAMPUSES = "__ALL__";

// Campus values are full names like "Campus Esplanade" or "Manufacture des Tabacs" — trimmed to
// just the distinctive part for the compact active-filter chip label, which otherwise gets
// noticeably wide with the dyslexia-friendly font on.
const CAMPUS_PREFIX_PATTERN = /^(Campus|Site|Rue|Manufacture des?)\s+/i;
function shortenCampusLabel(campus: string): string {
  return campus.replace(CAMPUS_PREFIX_PATTERN, "");
}

export default function StudyScreen() {
  useTabHaptics();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(ALL_CAMPUSES);
  const [isCampusPickerVisible, setIsCampusPickerVisible] = useState(false);
  const { departments, toggleFavorite } = useDepartments();
  const { settings } = useSettings();
  const insets = useSafeAreaInsets();

  const iconColor = useThemeColor({}, "icon");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const favoriteColor = useThemeColor({}, "favorite");
  const chipBackgroundColor = useThemeColor(
    { light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.1)" },
    "background",
  );
  const isCampusFilterActive = selectedCampus !== ALL_CAMPUSES;

  // Native header search bar (a real UISearchController on iOS) instead of a custom TextInput —
  // options must be set imperatively since headerSearchBarOptions needs to call back into this
  // screen's own state. iOS's search bar follows the system light/dark appearance on its own;
  // Android's doesn't — it defaults to dark-on-light regardless of the app's theme unless told
  // otherwise, so textColor/hintTextColor/headerIconColor need to be set explicitly here.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: t("study.searchPlaceholder"),
        autoCapitalize: "none",
        textColor,
        hintTextColor: iconColor,
        headerIconColor: iconColor,
        onChangeText: (event: { nativeEvent: { text: string } }) =>
          setSearchQuery(event.nativeEvent.text),
      },
    });
  }, [navigation, t, textColor, iconColor]);

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

    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
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
      contentContainerStyle={[
        styles.listContent,
        // `contentInsetAdjustmentBehavior` is iOS-only — it already auto-clears both the large-
        // title header and the tab bar there, so `listContent`'s own padding is just decorative
        // extra breathing room on iOS. Android gets neither adjustment automatically, so it needs
        // explicit clearance for the tab bar sitting below this screen.
        Platform.OS === "android" && { paddingBottom: insets.bottom + TAB_BAR_CLEARANCE },
      ]}
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
          hitSlop={{ top: 8, bottom: 8 }}
          accessibilityRole="button"
          accessibilityLabel={t("study.favoritesOnlyA11y")}
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
            {t("study.favorites")}
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
          hitSlop={{ top: 8, bottom: 8 }}
          accessibilityRole="button"
          accessibilityLabel={t("study.filterByCampusA11y")}
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
            {isCampusFilterActive ? shortenCampusLabel(selectedCampus) : t("study.filter")}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {isCampusPickerVisible && (
        <View style={styles.campusFilterContainer}>
          <ThemedText style={styles.campusFilterLabel}>
            {t("study.chooseCampus")}
          </ThemedText>
          <View style={styles.campusFilterOptions}>
            {campusOptions.map((option) => (
              <Chip
                key={option}
                label={option === ALL_CAMPUSES ? t("common.all") : option}
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
              ? t("study.noFavoriteBuildings")
              : t("study.noBuildingsFound")
          }
          subtitle={
            showFavoritesOnly
              ? t("study.addToFavoritesHint")
              : t("study.adjustSearchOrFilters")
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
                    hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }}
                    accessibilityRole="button"
                    accessibilityLabel={
                      item.isFavorite
                        ? t("study.removeFromFavoritesA11y")
                        : t("study.addToFavoritesA11y")
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
    // iOS: the large-title header + native search bar auto-collapse/inset via
    // contentInsetAdjustmentBehavior, so this is just a small extra nudge. Android's header
    // doesn't collapse and isn't auto-inset for, so it needs a much bigger gap below it.
    paddingTop: Platform.OS === "ios" ? Spacing.xs : Spacing.xl,
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
