/**
 * Vehicle Card Component
 *
 * High-legibility card designed for commuters to identify their ride at a glance.
 * 
 * PRD Requirements fulfilled:
 * ✅ Vehicle registration label — large, bold at top
 * ✅ Clear transit status — "Arriving at", "In Transit to", "Stopped at" with colored dot
 * ✅ Latitude and longitude — displayed in monospace
 * ✅ Last update time — relative format ("2 min ago") in brand-colored badge
 * ✅ Emphasize vehicle destination — trip headsign shown prominently
 * ✅ Emphasize current stop name — displayed as standalone line
 * 
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

/**
 * Returns a short human-readable status prefix.
 */
function getStatusPrefix(status: VehicleStatus): string {
  switch (status) {
    case 'IN_TRANSIT_TO':
      return 'In Transit to';
    case 'STOPPED_AT':
      return 'Stopped at';
    case 'INCOMING_AT':
      return 'Arriving at';
    default:
      return 'Status:';
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
  const statusPrefix = getStatusPrefix(vehicle.currentStatus);

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
      accessibilityLabel={`Vehicle ${vehicle.label}, ${vehicle.statusText}, heading to ${vehicle.tripHeadsign}, updated ${vehicle.relativeTime}`}
    >
      {/* Route color accent bar */}
      <View style={[styles.accentBar, { backgroundColor: vehicle.routeColor }]} />

      <View style={styles.content}>
        {/* Row 1: Vehicle Label + Route Badge */}
        <View style={styles.topRow}>
          <Text style={[styles.vehicleLabel, { color: colors.text }]}>
            #{vehicle.label}
          </Text>
          <View style={[styles.routeBadge, { backgroundColor: vehicle.routeColor }]}>
            <Text style={[styles.routeBadgeText, { color: vehicle.routeTextColor }]}>
              {vehicle.routeShortName || vehicle.routeId}
            </Text>
          </View>
        </View>

        {/* Row 2: Destination (headsign) — EMPHASIZED per PRD */}
        <Text style={[styles.destination, { color: colors.text }]} numberOfLines={1}>
          → {vehicle.tripHeadsign}
        </Text>

        {/* Row 3: Transit Status with stop name — PRD: "Arriving at / In Transit to / Stopped at" */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusPrefix, { color: statusColor }]}>
            {statusPrefix}
          </Text>
          <Text style={[styles.stopName, { color: colors.text }]} numberOfLines={1}>
            {vehicle.stopName}
          </Text>
        </View>

        {/* Row 4: Coordinates — PRD: latitude and longitude */}
        <Text style={[styles.coordinates, { color: colors.textTertiary }]}>
          {vehicle.latitude.toFixed(5)}, {vehicle.longitude.toFixed(5)}
        </Text>

        {/* Row 5: Last update time — PRD: relative format for user trust */}
        <View style={styles.bottomRow}>
          <Text style={[styles.directionText, { color: colors.textSecondary }]} numberOfLines={1}>
            {vehicle.directionLabel} · {vehicle.routeName}
          </Text>
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
  // Row 1
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  // Row 2 — Destination (emphasized)
  destination: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
  },
  // Row 3 — Status + Stop name
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPrefix: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  stopName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  // Row 4 — Coordinates
  coordinates: {
    fontSize: FontSize.xs,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.3,
  },
  // Row 5 — Direction + Time
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  directionText: {
    fontSize: FontSize.xs,
    flex: 1,
    marginRight: Spacing.sm,
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
