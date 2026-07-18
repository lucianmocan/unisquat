import { ThemedText } from '@/components/themed-text';
import { Card, CardSeparator, Row } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Switch } from '@/components/ui/switch';
import { ACCENT_COLORS, AccentColorKey, Spacing } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics } from '@/services/haptics';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function PersonalizationScreen() {
  const { settings, updateSetting } = useSettings();
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme() ?? 'light';

  const handleAccentColorChange = (color: AccentColorKey) => {
    haptics.impact();
    updateSetting('accentColor', color);
  };

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.listContent} contentInsetAdjustmentBehavior="automatic">
      <ThemedText type="caption" style={styles.sectionHeader}>Filters</ThemedText>
      <Card>
        <Row
          icon={<IconSymbol name="line.3.horizontal.decrease.circle" size={22} color={iconColor} />}
          title="Auto-Collapse on Search"
          subtitle="Hide the campus filter panel once you pick an option"
          right={
            <Switch
              value={settings.autoCollapseSearchFilters}
              onValueChange={(value) => updateSetting('autoCollapseSearchFilters', value)}
            />
          }
        />
        <CardSeparator />
        <Row
          icon={<IconSymbol name="line.3.horizontal.decrease.circle" size={22} color={iconColor} />}
          title="Auto-Collapse on Building Page"
          subtitle="Hide the room-type filter panel once you pick an option"
          right={
            <Switch
              value={settings.autoCollapseDepartmentFilters}
              onValueChange={(value) => updateSetting('autoCollapseDepartmentFilters', value)}
            />
          }
        />
      </Card>

      <ThemedText type="caption" style={styles.sectionHeader}>Haptics</ThemedText>
      <Card>
        <Row
          icon={<IconSymbol name="hand.tap.fill" size={22} color={iconColor} />}
          title="Haptic Feedback"
          subtitle="Vibrate on taps and selections throughout the app"
          right={
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(value) => updateSetting('hapticsEnabled', value)}
            />
          }
        />
      </Card>

      <ThemedText type="caption" style={styles.sectionHeader}>Accent Color</ThemedText>
      <Card style={styles.swatchCard}>
        <View style={styles.swatchGrid}>
          {(Object.keys(ACCENT_COLORS) as AccentColorKey[]).map((key) => {
            const config = ACCENT_COLORS[key];
            const isSelected = settings.accentColor === key;
            const swatchColor = config[colorScheme];

            return (
              <TouchableOpacity
                key={key}
                onPress={() => handleAccentColorChange(key)}
                style={styles.swatchButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={config.label}
                accessibilityState={{ selected: isSelected }}>
                <View style={[styles.swatchRing, { borderColor: isSelected ? textColor : 'transparent' }]}>
                  <View style={[styles.swatch, { backgroundColor: swatchColor }]} />
                </View>
                <ThemedText type="caption" numberOfLines={1}>
                  {config.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>
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
  },
  sectionHeader: {
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  swatchCard: {
    padding: Spacing.lg,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  swatchButton: {
    alignItems: 'center',
    gap: Spacing.xs,
    width: 64,
  },
  swatchRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
