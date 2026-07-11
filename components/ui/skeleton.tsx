import { Radius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

/** A pulsing placeholder block — the building unit for loading skeletons. */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const backgroundColor = useThemeColor({ light: 'rgba(0,0,0,0.08)', dark: 'rgba(255,255,255,0.12)' }, 'background');
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.base, { backgroundColor, opacity }, style]} />;
}

function RoomRowSkeleton() {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.text}>
        <Skeleton style={rowStyles.title} />
        <Skeleton style={rowStyles.subtitle} />
      </View>
      <Skeleton style={rowStyles.time} />
    </View>
  );
}

/** Placeholder shaped like RoomsList's rows, shown while a department's calendar is downloading. */
export function RoomsListSkeleton() {
  return (
    <View style={rowStyles.container}>
      {[0, 1, 2, 3, 4].map(i => (
        <View key={i}>
          {i > 0 && <View style={rowStyles.separator} />}
          <RoomRowSkeleton />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
  },
});

const rowStyles = StyleSheet.create({
  container: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  text: {
    gap: 6,
  },
  title: {
    width: 140,
    height: 16,
  },
  subtitle: {
    width: 90,
    height: 12,
  },
  time: {
    width: 50,
    height: 16,
  },
  separator: {
    height: 1,
    marginVertical: 12,
    opacity: 0.1,
    backgroundColor: '#666666',
  },
});
