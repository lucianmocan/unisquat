import { ThemedText } from '@/components/themed-text';
import { Card, CardSeparator, Row } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, TAB_BAR_CLEARANCE } from '@/constants/theme';
import { useTabHaptics } from '@/hooks/use-tab-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics, NotificationFeedbackType } from '@/services/haptics';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GITHUB_REPO_URL = 'https://github.com/lucianmocan/unisquat';
const GITHUB_NEW_ISSUE_URL = `${GITHUB_REPO_URL}/issues/new`;

export default function SettingsScreen() {
  useTabHaptics();
  const { t } = useTranslation();
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'error');
  const successColor = useThemeColor({}, 'success');
  const infoColor = useThemeColor({}, 'info');
  const insets = useSafeAreaInsets();

  // Row already fires its own haptic on press for all the handlers below.
  const handleAbout = () => {
    router.push('/settings/about');
  };

  const handlePersonalization = () => {
    router.push('/settings/personalization');
  };

  const handleAccessibility = () => {
    router.push('/settings/accessibility');
  };

  const handleLanguage = () => {
    router.push('/settings/language');
  };

  const handleOpenUrl = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      haptics.notification(NotificationFeedbackType.Warning);
      Alert.alert(t('settingsScreen.unableToOpenLinkTitle'), url, [{ text: t('common.ok') }]);
    }
  };

  const handleFeedback = () => handleOpenUrl(GITHUB_NEW_ISSUE_URL);

  const handleViewSource = () => handleOpenUrl(GITHUB_REPO_URL);

  const handlePrivacyPolicy = () => {
    router.push('/settings/privacy-policy');
  };

  const handleTermsOfService = () => {
    router.push('/settings/terms-of-service');
  };

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={[
        styles.listContent,
        // contentInsetAdjustmentBehavior is iOS-only and already clears the tab bar there —
        // Android gets no such adjustment, so it needs explicit clearance added here.
        Platform.OS === 'android' && { paddingBottom: insets.bottom + TAB_BAR_CLEARANCE },
      ]}
      contentInsetAdjustmentBehavior="automatic">
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
        <CardSeparator />
        <Row
          icon={<IconSymbol name="accessibility" size={22} color={iconColor} />}
          title={t('settingsScreen.accessibility')}
          subtitle={t('settingsScreen.accessibilitySubtitle')}
          onPress={handleAccessibility}
        />
      </Card>

      <ThemedText type="caption" style={styles.sectionHeader}>{t('settingsScreen.support')}</ThemedText>
      <Card>
        <Row
          icon={<IconSymbol name="bubble.left.and.bubble.right.fill" size={22} color={errorColor} />}
          title={t('settingsScreen.feedback')}
          subtitle={t('settingsScreen.feedbackSubtitle')}
          onPress={handleFeedback}
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
        <CardSeparator />
        <Row
          icon={<IconSymbol name="chevron.left.forwardslash.chevron.right" size={22} color={iconColor} />}
          title={t('settingsScreen.viewSource')}
          subtitle={t('settingsScreen.viewSourceSubtitle')}
          onPress={handleViewSource}
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
