import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

export type LegalSection = {
  heading: string;
  body: string;
};

interface LegalDocumentProps {
  lastUpdated: string;
  sections: LegalSection[];
}

/**
 * Shared layout for the Privacy Policy and Terms of Service screens. Content is deliberately
 * English-only regardless of the app's active language (legal text is high-stakes to mistranslate),
 * so only the `legalScreen.englishOnlyNotice` line is translated — everything else is passed in
 * as plain English strings by the caller.
 */
export function LegalDocument({ lastUpdated, sections }: LegalDocumentProps) {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.listContent} contentInsetAdjustmentBehavior="automatic">
      <ThemedText type="caption" style={styles.notice}>
        {t('legalScreen.englishOnlyNotice')}
      </ThemedText>
      <ThemedText type="caption" style={styles.lastUpdated}>
        Last updated: {lastUpdated}
      </ThemedText>
      {sections.map(section => (
        <ThemedText key={section.heading} style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.heading}>
            {section.heading}
            {'\n'}
          </ThemedText>
          {section.body}
        </ThemedText>
      ))}
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
  notice: {
    fontStyle: 'italic',
  },
  lastUpdated: {
    marginTop: -Spacing.sm,
  },
  section: {
    lineHeight: 22,
  },
  heading: {
    fontSize: 17,
  },
});
