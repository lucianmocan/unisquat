import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

const CREDIT_URL = 'https://unisquat.alwaysdata.net/';

export default function AboutScreen() {
  const tintColor = useThemeColor({}, 'tint');

  const handleOpenCredit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(CREDIT_URL);
  };

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/icon.png')} style={styles.icon} />
      <ThemedText type="title">UniSquat</ThemedText>
      <ThemedText type="caption">Version 1.0.0</ThemedText>

      <Card style={styles.descriptionCard}>
        <ThemedText style={styles.description}>
          Find an empty room to study or work in at Université de Strasbourg — UniSquat checks the
          university&apos;s room-booking schedules and shows you which rooms are free right now.
        </ThemedText>
      </Card>

      <TouchableOpacity onPress={handleOpenCredit} activeOpacity={0.7}>
        <ThemedText type="caption">
          Inspired by <ThemedText type="link" style={{ color: tintColor }}>unisquat.alwaysdata.net</ThemedText>
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 22,
    marginBottom: Spacing.md,
  },
  descriptionCard: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
