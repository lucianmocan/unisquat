import { ThemedText } from '@/components/themed-text';
import { Card, CardSeparator, Row } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LanguageCode, SUPPORTED_LANGUAGES } from '@/i18n';
import { haptics } from '@/services/haptics';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

export default function LanguageScreen() {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();
  const tintColor = useThemeColor({}, 'tint');

  // Sorted by native name, not declaration order — each language names itself, so this is a
  // best-effort alphabetical ordering across mixed scripts rather than a single true alphabet.
  const sortedLanguages = useMemo(
    () => [...SUPPORTED_LANGUAGES].sort((a, b) => a.nativeName.localeCompare(b.nativeName)),
    []
  );

  const handleSelect = (language: LanguageCode | 'system') => {
    haptics.impact();
    updateSetting('language', language);
  };

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.listContent} contentInsetAdjustmentBehavior="automatic">
      <Card>
        <Row
          title={t('languageScreen.systemDefault')}
          subtitle={t('languageScreen.systemDefaultSubtitle')}
          onPress={() => handleSelect('system')}
          right={settings.language === 'system' ? <IconSymbol name="checkmark.circle.fill" size={22} color={tintColor} /> : undefined}
        />
        <CardSeparator />
        {sortedLanguages.map((language, index) => (
          <Fragment key={language.code}>
            {index > 0 && <CardSeparator />}
            <Row
              title={language.nativeName}
              onPress={() => handleSelect(language.code)}
              right={
                settings.language === language.code ? (
                  <IconSymbol name="checkmark.circle.fill" size={22} color={tintColor} />
                ) : undefined
              }
            />
          </Fragment>
        ))}
      </Card>
      <ThemedText type="caption" style={styles.footnote}>
        {t('settingsScreen.chooseLanguage')}
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
  footnote: {
    marginTop: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
