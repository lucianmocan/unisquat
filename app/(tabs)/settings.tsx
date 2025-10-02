import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Alert, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: 'rgba(255,255,255,0.1)' }, 'background');

  const handleAbout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'About UniSquat',
      'UniSquat v1.0.0',
      [{ text: 'OK' }]
    );
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

  const handlePrivacyPolicy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Privacy Policy',
      'Privacy policy feature coming soon!\nWe take your privacy seriously.',
      [{ text: 'OK' }]
    );
  };

  const handleTermsOfService = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Terms of Service',
      'Terms of service feature coming soon!\nPlease use the app responsibly.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Ionicons
          size={310}
          name="settings-outline"
          style={styles.headerIcon}
          color={iconColor}
        />
      }>
      
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
        <Ionicons name="cog" size={32} color={tintColor} />
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">General</ThemedText>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={handleLanguage}
          activeOpacity={0.7}>
          <ThemedView style={[styles.settingContent, { backgroundColor}]}>
            <Ionicons name="language" size={24} color={iconColor} />
            <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Language</ThemedText>
                <ThemedText style={styles.settingDescription}>
                Choose your preferred language
                </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={iconColor} />
          </ThemedView>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={handleTime}
          activeOpacity={0.7}>
          <ThemedView style={[styles.settingContent, { backgroundColor}]}>
            <Ionicons name="time" size={24} color={iconColor} />
            <View style={styles.settingText}>
              <ThemedText type="defaultSemiBold">Time</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Set your time preferences
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={iconColor} />
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Support</ThemedText>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={handleReportIssue}
          activeOpacity={0.7}>
          <ThemedView style={[styles.settingContent, { backgroundColor }]}>
            <Ionicons name="bug" size={24} color="#ff4444" />
            <View style={styles.settingText}>
              <ThemedText type="defaultSemiBold">Report an Issue</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Let us know if something&apos;s not working
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={iconColor} />
          </ThemedView>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={handleSuggestion}
          activeOpacity={0.7}>
          <ThemedView style={[styles.settingContent, { backgroundColor }]}>
            <Ionicons name="bulb" size={24} color="#ffaa00" />
            <View style={styles.settingText}>
              <ThemedText type="defaultSemiBold">Suggestions</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Share your ideas to improve the app
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={iconColor} />
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">About</ThemedText>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={handleAbout}
          activeOpacity={0.7}>
          <ThemedView style={[styles.settingContent, { backgroundColor }]}>
            <Ionicons name="information-circle" size={24} color={tintColor} />
            <View style={styles.settingText}>
              <ThemedText type="defaultSemiBold">About UniSquat</ThemedText>
              <ThemedText style={styles.settingDescription}>
                App version and information
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={iconColor} />
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>

      {/* Legal Section */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Legal</ThemedText>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={handlePrivacyPolicy}
          activeOpacity={0.7}>
          <ThemedView style={[styles.settingContent, { backgroundColor }]}>
            <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            <View style={styles.settingText}>
              <ThemedText type="defaultSemiBold">Privacy Policy</ThemedText>
              <ThemedText style={styles.settingDescription}>
                How we handle your data
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={iconColor} />
          </ThemedView>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={handleTermsOfService}
          activeOpacity={0.7}>
          <ThemedView style={[styles.settingContent, { backgroundColor }]}>
            <Ionicons name="document-text" size={24} color="#2196F3" />
            <View style={styles.settingText}>
              <ThemedText type="defaultSemiBold">Terms of Service</ThemedText>
              <ThemedText style={styles.settingDescription}>
                App usage terms and conditions
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={iconColor} />
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>

      {/* Footer */}
      <ThemedView style={styles.footerContainer}>
        <ThemedText style={styles.footerText}>
          Inspired by https://unisquat.alwaysdata.net/
        </ThemedText>
        <ThemedText style={[styles.footerText, styles.versionText]}>
          Version 1.0.0
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  sectionContainer: {
    gap: 8,
    marginBottom: 24,
  },
  settingItem: {
    marginTop: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingText: {
    flex: 1,
    gap: 2,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  versionText: {
    fontSize: 12,
  },
});
