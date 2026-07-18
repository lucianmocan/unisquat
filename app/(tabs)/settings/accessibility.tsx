import { ThemedText } from '@/components/themed-text';
import { Card, CardSeparator, Row } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

// Discrete steps rather than a free slider — no slider dependency needed, and matches the
// native SegmentedControl already used elsewhere in the app (e.g. the Now/Later toggle).
const FONT_SCALE_STEPS = [0.9, 1, 1.15, 1.3];

export default function AccessibilityScreen() {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();
  const iconColor = useThemeColor({}, 'icon');

  const fontSizeLabels = [
    t('accessibilityScreen.fontSizeSmall'),
    t('accessibilityScreen.fontSizeDefault'),
    t('accessibilityScreen.fontSizeLarge'),
    t('accessibilityScreen.fontSizeExtraLarge'),
  ];
  const fontScaleIndex = FONT_SCALE_STEPS.includes(settings.fontScale)
    ? FONT_SCALE_STEPS.indexOf(settings.fontScale)
    : FONT_SCALE_STEPS.indexOf(1);

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.listContent} contentInsetAdjustmentBehavior="automatic">
      <ThemedText type="caption" style={styles.sectionHeader}>{t('accessibilityScreen.textSection')}</ThemedText>
      <Card>
        <Row
          icon={<IconSymbol name="bold" size={22} color={iconColor} />}
          title={t('accessibilityScreen.boldText')}
          subtitle={t('accessibilityScreen.boldTextSubtitle')}
          right={
            <Switch
              value={settings.boldText}
              onValueChange={(value) => updateSetting('boldText', value)}
              accessibilityLabel={t('accessibilityScreen.boldText')}
            />
          }
        />
        <CardSeparator />
        <Row
          icon={<IconSymbol name="textformat" size={22} color={iconColor} />}
          title={t('accessibilityScreen.dyslexiaFont')}
          subtitle={t('accessibilityScreen.dyslexiaFontSubtitle')}
          right={
            <Switch
              value={settings.dyslexiaFont}
              onValueChange={(value) => updateSetting('dyslexiaFont', value)}
              accessibilityLabel={t('accessibilityScreen.dyslexiaFont')}
            />
          }
        />
      </Card>
      <Card style={styles.textSizeCard}>
        <ThemedText style={styles.textSizeLabel}>{t('accessibilityScreen.textSize')}</ThemedText>
        <SegmentedControl
          options={fontSizeLabels}
          selectedIndex={fontScaleIndex}
          onChange={(index) => updateSetting('fontScale', FONT_SCALE_STEPS[index])}
        />
      </Card>

      <ThemedText type="caption" style={styles.footnote}>
        {t('accessibilityScreen.footnote')}
      </ThemedText>
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
  textSizeCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  textSizeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  footnote: {
    marginTop: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
