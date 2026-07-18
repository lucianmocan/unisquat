import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics } from '@/services/haptics';
import { ReactNode } from 'react';
import { AccessibilityRole, LayoutChangeEvent, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Groups `children` into one VoiceOver/TalkBack stop instead of reading each Text separately. */
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
}

/** A rounded, shadowed surface — the shared container for grouped rows or standalone content. */
export function Card({ children, style, onLayout, accessible, accessibilityLabel, accessibilityRole }: CardProps) {
  const backgroundColor = useThemeColor({}, 'card');

  return (
    <View
      style={[styles.card, { backgroundColor }, style]}
      onLayout={onLayout}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}>
      {children}
    </View>
  );
}

/** A hairline divider between rows inside a Card, inset to align with row text. */
export function CardSeparator({ inset = 56 }: { inset?: number }) {
  const borderColor = useThemeColor({}, 'border');
  return <View style={[styles.separator, { backgroundColor: borderColor, marginLeft: inset }]} />;
}

interface RowProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  onPress?: () => void;
  right?: ReactNode;
  /**
   * Whether `right` has a touchable of its own (e.g. a favorite-toggle button or a Switch).
   * When `true`, `right` stays a sibling of the tappable area rather than its child — nesting
   * touchables breaks on web (invalid `<button>`-in-`<button>`) and is fragile on native.
   * Defaults to `!!right`: a row with no `right` at all has nothing to conflict with, so the
   * whole row — including the trailing padding and chevron — becomes the tap target; a row
   * that does pass `right` keeps it separate unless explicitly overridden.
   */
  rightIsInteractive?: boolean;
  showChevron?: boolean;
  titleNumberOfLines?: number;
  accessibilityLabel?: string;
}

/** icon + title/subtitle + trailing accessory — used for both department and settings rows. */
export function Row({
  icon,
  title,
  subtitle,
  subtitleColor,
  onPress,
  right,
  rightIsInteractive = !!right,
  showChevron = !!onPress,
  titleNumberOfLines,
  accessibilityLabel,
}: RowProps) {
  const iconColor = useThemeColor({}, 'icon');

  const handlePress = onPress
    ? () => {
        haptics.impact();
        onPress();
      }
    : undefined;

  const textContent = (
    <>
      {icon && <View style={styles.icon}>{icon}</View>}
      <View style={styles.textContainer}>
        <ThemedText type="defaultSemiBold" numberOfLines={titleNumberOfLines}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText type="caption" style={subtitleColor ? { color: subtitleColor } : undefined}>
            {subtitle}
          </ThemedText>
        )}
      </View>
    </>
  );

  const defaultLabel = subtitle ? `${title}, ${subtitle}` : title;

  if (onPress && !rightIsInteractive) {
    return (
      <TouchableOpacity
        style={[styles.row, styles.content]}
        onPress={handlePress}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? defaultLabel}>
        {textContent}
        {right}
        {showChevron && <IconSymbol name="chevron.right" size={18} color={iconColor} />}
      </TouchableOpacity>
    );
  }

  const Content = onPress ? TouchableOpacity : View;

  return (
    <View style={styles.row}>
      <Content
        style={styles.content}
        onPress={handlePress}
        activeOpacity={onPress ? 0.7 : undefined}
        // Without `accessible`, a plain View's accessibilityLabel is inert — VoiceOver/TalkBack
        // would instead read the title and subtitle Text children as two separate, disconnected
        // stops, ignoring this label entirely.
        accessible
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={accessibilityLabel ?? defaultLabel}>
        {textContent}
      </Content>
      {right}
      {showChevron && <IconSymbol name="chevron.right" size={18} color={iconColor} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 28,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
});
