/**
 * Vehicle Card Component
 *
 * High-legibility card designed for commuters to identify their ride at a glance.
 * Shows vehicle label, transit status, coordinates, route info, and last update time.
 * Optimized with React.memo for FlatList performance.
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Brand, Colors, FontSize, FontWeight, Radius, Shadows, Spacing } from '@/constants/theme';
import { getStatusLabel } from '@/services/mbta-adapter';
import type { CommuterVehicle, VehicleStatus } from '@/services/types';

interface VehicleCardProps {
  vehicle: CommuterVehicle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Returns the status indicator color based on vehicle status.
 */
function getStatusColor(status: VehicleStatus, colorScheme: 'light' | 'dark'): string {
  switch (status) {
    case 'IN_TRANSIT_TO':
      return Colors[colorScheme].success;
    case 'STOPPED_AT':
      return Brand.primary;
    case 'INCOMING_AT':
      return Colors[colorScheme].warning;
    default:
      return Colors[colorScheme].textTertiary;
  }
}

export const VehicleCard = React.memo(function VehicleCard({ vehicle }: VehicleCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, [scale]);

  const handlePress = useCallback(() => {
    router.push(`/vehicle/${vehicle.id}`);
  }, [router, vehicle.id]);

  const statusColor = getStatusColor(vehicle.currentStatus, colorScheme);

  return (
    <AnimatedPressable
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        Shadows.md,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`Vehicle ${vehicle.label}, ${vehicle.statusText}, updated ${vehicle.relativeTime}`}
    >
      {/* Route color accent bar */}
      <View style={[styles.accentBar, { backgroundColor: vehicle.routeColor }]} />

      <View style={styles.content}>
        {/* Top Row: Vehicle Label + Route Badge */}
        <View style={styles.topRow}>
          <View style={styles.labelRow}>
            <Text style={[styles.vehicleLabel, { color: colors.text }]}>
              #{vehicle.label}
            </Text>
          </View>
          <View style={[styles.routeBadge, { backgroundColor: vehicle.routeColor }]}>
            <Text style={[styles.routeBadgeText, { color: vehicle.routeTextColor }]}>
              {vehicle.routeShortName || vehicle.routeId}
            </Text>
          </View>
        </View>

        {/* Status Line */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: colors.text }]} numberOfLines={1}>
            {vehicle.statusText}
          </Text>
        </View>

        {/* Route Name */}
        <Text style={[styles.routeName, { color: colors.textSecondary }]} numberOfLines={1}>
          {vehicle.routeName}
        </Text>

        {/* Coordinates */}
        <Text style={[styles.coordinates, { color: colors.textTertiary }]}>
          {vehicle.latitude.toFixed(5)}, {vehicle.longitude.toFixed(5)}
        </Text>

        {/* Bottom Row: Direction + Updated Time */}
        <View style={styles.bottomRow}>
          <View style={styles.directionRow}>
            <Text style={[styles.directionIcon, { color: colors.textTertiary }]}>
              {vehicle.directionId === 0 ? '→' : '←'}
            </Text>
            <Text style={[styles.directionText, { color: colors.textSecondary }]}>
              {vehicle.directionLabel} · {vehicle.tripHeadsign}
            </Text>
          </View>
          <View style={[styles.timeBadge, { backgroundColor: Brand.primaryAlpha10 }]}>
            <Text style={[styles.timeText, { color: Brand.primary }]}>
              {vehicle.relativeTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Chevron indicator */}
      <View style={styles.chevronContainer}>
        <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  accentBar: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vehicleLabel: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  routeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    minWidth: 40,
    alignItems: 'center',
  },
  routeBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  routeName: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  coordinates: {
    fontSize: FontSize.xs,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  directionIcon: {
    fontSize: FontSize.md,
  },
  directionText: {
    fontSize: FontSize.sm,
    flex: 1,
  },
  timeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  timeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingRight: Spacing.md,
  },
  chevron: {
    fontSize: 24,
    fontWeight: FontWeight.medium,
  },
});
