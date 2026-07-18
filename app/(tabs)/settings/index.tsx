import { ThemedText } from '@/components/themed-text';
import { Card, CardSeparator, Row } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useTabHaptics } from '@/hooks/use-tab-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics, NotificationFeedbackType } from '@/services/haptics';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, ScrollView, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  useTabHaptics();
  const { t } = useTranslation();
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'error');
  const warningColor = useThemeColor({}, 'warning');
  const successColor = useThemeColor({}, 'success');
  const infoColor = useThemeColor({}, 'info');

  // Row already fires its own haptic on press for all the handlers below.
  const handleAbout = () => {
    router.push('/settings/about');
  };

  const handlePersonalization = () => {
    router.push('/settings/personalization');
  };

  const handleLanguage = () => {
    router.push('/settings/language');
  };

  const handleReportIssue = async () => {
    const email = 'support@unisquat.app';
    const subject = t('settingsScreen.issueReportSubject');
    const body = t('settingsScreen.issueReportBody');

    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      haptics.notification(NotificationFeedbackType.Warning);
      Alert.alert(
        t('settingsScreen.unableToOpenEmailTitle'),
        t('settingsScreen.sendIssueReportTo', { email }),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleSuggestion = async () => {
    const email = 'feedback@unisquat.app';
    const subject = t('settingsScreen.suggestionSubject');
    const body = t('settingsScreen.suggestionBody');

    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      haptics.notification(NotificationFeedbackType.Warning);
      Alert.alert(
        t('settingsScreen.unableToOpenEmailTitle'),
        t('settingsScreen.sendSuggestionTo', { email }),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      t('settingsScreen.privacyPolicy'),
      t('settingsScreen.privacyPolicyComingSoonMessage'),
      [{ text: t('common.ok') }]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      t('settingsScreen.termsOfService'),
      t('settingsScreen.termsComingSoonMessage'),
      [{ text: t('common.ok') }]
    );
  };

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.listContent} contentInsetAdjustmentBehavior="automatic">
      <ThemedText type="caption" style={styles.sectionHeader}>{t('settingsScreen.general')}</ThemedText>
      <Card>
        <Row
          icon={<IconSymbol name="globe" size={22} color={iconColor} />}
          title={t('settingsScreen.language')}
          subtitle={t('settingsScreen.chooseLanguage')}
          onPress={handleLanguage}
        />
        <CardSeparator />
        <Row
          icon={<IconSymbol name="paintbrush.fill" size={22} color={iconColor} />}
          title={t('settingsScreen.personalization')}
          subtitle={t('settingsScreen.personalizationSubtitle')}
          onPress={handlePersonalization}
        />
      </Card>

      <ThemedText type="caption" style={styles.sectionHeader}>{t('settingsScreen.support')}</ThemedText>
      <Card>
        <Row
          icon={<IconSymbol name="ladybug.fill" size={22} color={errorColor} />}
          title={t('settingsScreen.reportIssue')}
          subtitle={t('settingsScreen.reportIssueSubtitle')}
          onPress={handleReportIssue}
        />
        <CardSeparator />
        <Row
          icon={<IconSymbol name="lightbulb.fill" size={22} color={warningColor} />}
          title={t('settingsScreen.suggestions')}
          subtitle={t('settingsScreen.suggestionsSubtitle')}
          onPress={handleSuggestion}
        />
      </Card>

      <ThemedText type="caption" style={styles.sectionHeader}>{t('settingsScreen.about')}</ThemedText>
      <Card>
        <Row
          icon={<IconSymbol name="info.circle.fill" size={22} color={tintColor} />}
          title={t('settingsScreen.aboutTitle')}
          subtitle={t('settingsScreen.aboutSubtitle')}
          onPress={handleAbout}
        />
      </Card>

      <ThemedText type="caption" style={styles.sectionHeader}>{t('settingsScreen.legal')}</ThemedText>
      <Card>
        <Row
          icon={<IconSymbol name="checkmark.shield.fill" size={22} color={successColor} />}
          title={t('settingsScreen.privacyPolicy')}
          subtitle={t('settingsScreen.privacyPolicySubtitle')}
          onPress={handlePrivacyPolicy}
        />
        <CardSeparator />
        <Row
          icon={<IconSymbol name="doc.text.fill" size={22} color={infoColor} />}
          title={t('settingsScreen.termsOfService')}
          subtitle={t('settingsScreen.termsSubtitle')}
          onPress={handleTermsOfService}
        />
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
});
