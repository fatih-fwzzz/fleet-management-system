




import React, { useEffect } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing } from
'react-native-reanimated';
import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';

function ShimmerBlock({ width, height, style }: {width: number | string;height: number;style?: object;}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[
      {
        width: width as number,
        height,
        backgroundColor: colors.skeleton,
        borderRadius: Radius.xs
      },
      animatedStyle,
      style]
      } />);


}

export function VehicleCardSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, Shadows.md]}>
      {}
      <View style={[styles.accentBar, { backgroundColor: colors.skeleton }]} />

      <View style={styles.content}>
        {}
        <View style={styles.topRow}>
          <ShimmerBlock width={80} height={28} />
          <ShimmerBlock width={48} height={24} style={{ borderRadius: Radius.full }} />
        </View>

        {}
        <ShimmerBlock width="85%" height={18} style={{ marginTop: Spacing.sm }} />

        {}
        <ShimmerBlock width="60%" height={14} style={{ marginTop: Spacing.md }} />

        {}
        <View style={[styles.bottomRow, { marginTop: Spacing.md }]}>
          <ShimmerBlock width={100} height={14} />
          <ShimmerBlock width={64} height={22} style={{ borderRadius: Radius.full }} />
        </View>
      </View>
    </View>);

}




export function VehicleCardSkeletonList({ count = 5 }: {count?: number;}) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) =>
      <VehicleCardSkeleton key={`skeleton-${index}`} />
      )}
    </View>);

}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden'
  },
  accentBar: {
    width: 5
  },
  content: {
    flex: 1,
    padding: Spacing.lg
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  list: {
    paddingTop: Spacing.md
  }
});