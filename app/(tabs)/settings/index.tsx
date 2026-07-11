import { ThemedText } from '@/components/themed-text';
import { Card, CardSeparator, Row } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Alert, Linking, ScrollView, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'error');
  const warningColor = useThemeColor({}, 'warning');
  const successColor = useThemeColor({}, 'success');
  const infoColor = useThemeColor({}, 'info');

  const handleAbout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings/about');
  };

  const handleLanguage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Language Settings',
      'Language selection feature coming soon!\nCurrently supporting English.',
      [{ text: 'OK' }]
    );
  };

  const handleTime = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Time Settings',
      'Time configuration feature coming soon!\nCurrently using device timezone & time format.',
      [{ text: 'OK' }]
    );
  };

  const handleReportIssue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const email = 'support@unisquat.app';
    const subject = 'Issue Report - UniSquat App';
    const body = 'Please describe the issue you encountered:\n\n';

    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Unable to open email',
        `Please send your issue report to: ${email}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleSuggestion = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const email = 'feedback@unisquat.app';
    const subject = 'Feature Suggestion - UniSquat App';
    const body = 'I would like to suggest the following feature:\n\n';

    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Unable to open email',
        `Please send your suggestion to: ${email}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handlePrivacyPolicy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Privacy Policy',
      'Privacy policy feature coming soon!\nWe take your privacy seriously.',
      [{ text: 'OK' }]
    );
  };

  const handleTermsOfService = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Terms of Service',
      'Terms of service feature coming soon!\nPlease use the app responsibly.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
      <ThemedText type="caption" style={styles.sectionHeader}>General</ThemedText>
      <Card>
        <Row
          icon={<IconSymbol name="globe" size={22} color={iconColor} />}
          title="Language"
          subtitle="Choose your preferred language"
          onPress={handleLanguage}
        />
        <CardSeparator />
        <Row
          icon={<IconSymbol name="clock" size={22} color={iconColor} />}
          title="Time"
          subtitle="Set your time preferences"
          onPress={handleTime}
        />
      </Card>

      <ThemedText type="caption" style={styles.sectionHeader}>Support</ThemedText>
      <Card>
        <Row
          icon={<IconSymbol name="ladybug.fill" size={22} color={errorColor} />}
          title="Report an Issue"
          subtitle="Let us know if something's not working"
          onPress={handleReportIssue}
        />
        <CardSeparator />
        <Row
          icon={<IconSymbol name="lightbulb.fill" size={22} color={warningColor} />}
          title="Suggestions"
          subtitle="Share your ideas to improve the app"
          onPress={handleSuggestion}
        />
      </Card>

      <ThemedText type="caption" style={styles.sectionHeader}>About</ThemedText>
      <Card>
        <Row
          icon={<IconSymbol name="info.circle.fill" size={22} color={tintColor} />}
          title="About UniSquat"
          subtitle="App version and information"
          onPress={handleAbout}
        />
      </Card>

      <ThemedText type="caption" style={styles.sectionHeader}>Legal</ThemedText>
      <Card>
        <Row
          icon={<IconSymbol name="checkmark.shield.fill" size={22} color={successColor} />}
          title="Privacy Policy"
          subtitle="How we handle your data"
          onPress={handlePrivacyPolicy}
        />
        <CardSeparator />
        <Row
          icon={<IconSymbol name="doc.text.fill" size={22} color={infoColor} />}
          title="Terms of Service"
          subtitle="App usage terms and conditions"
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
