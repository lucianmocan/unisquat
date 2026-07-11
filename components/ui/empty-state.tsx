import { ThemedText } from '@/components/themed-text';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as Haptics from 'expo-haptics';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  icon: IconSymbolName;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** A centered icon + message, optionally with a retry/action button — used for empty lists and fetch errors. */
export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={styles.container}>
      <IconSymbol name={icon} size={56} color={iconColor + '40'} />
      <ThemedText style={styles.title}>{title}</ThemedText>
      {subtitle && (
        <ThemedText type="caption" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAction();
          }}
          style={styles.action}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}>
          <ThemedText type="label" style={{ color: tintColor }}>
            {actionLabel}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
  },
});
