/**
 * Vehicle Detail View — Map-centric real-time tracking screen.
 * Shows a full-screen map with the vehicle's position and an info overlay.
 */

import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useVehicleDetail } from '@/hooks/use-vehicle-detail';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorState } from '@/components/error-state';
import { Brand, Colors, FontSize, FontWeight, Radius, Shadows, Spacing } from '@/constants/theme';
import { getStatusLabel } from '@/services/mbta-adapter';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const { data: vehicle, isLoading, isFetching, error, refetch } = useVehicleDetail(id);

  // Animate camera to vehicle position on updates
  useEffect(() => {
    if (vehicle && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: vehicle.latitude,
          longitude: vehicle.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500
      );
    }
  }, [vehicle?.latitude, vehicle?.longitude]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error && !vehicle) {
    return <ErrorState error={error as Error} onRetry={() => refetch()} />;
  }

  if (!vehicle) {
    return <ErrorState error={new Error('Vehicle not found.')} onRetry={() => refetch()} />;
  }

  const statusColor =
    vehicle.currentStatus === 'IN_TRANSIT_TO'
      ? colors.success
      : vehicle.currentStatus === 'INCOMING_AT'
        ? colors.warning
        : Brand.primary;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: vehicle.latitude,
          longitude: vehicle.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker
          coordinate={{
            latitude: vehicle.latitude,
            longitude: vehicle.longitude,
          }}
          title={`Vehicle #${vehicle.label}`}
          description={vehicle.statusText}
          pinColor={Brand.primary}
        />
      </MapView>

      {/* Fetching indicator */}
      {isFetching && (
        <View style={styles.fetchingBadge}>
          <ActivityIndicator size="small" color={Brand.primary} />
        </View>
      )}

      {/* Info Overlay Panel */}
      <View style={[styles.infoPanel, { backgroundColor: colors.surface, paddingBottom: insets.bottom + Spacing.lg }, Shadows.lg]}>
        {/* Vehicle Header */}
        <View style={styles.panelHeader}>
          <View style={styles.panelTitleRow}>
            <Text style={[styles.vehicleLabel, { color: colors.text }]}>#{vehicle.label}</Text>
            <View style={[styles.routeBadge, { backgroundColor: vehicle.routeColor }]}>
              <Text style={[styles.routeBadgeText, { color: vehicle.routeTextColor }]}>
                {vehicle.routeShortName || vehicle.routeId}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: colors.text }]}>{vehicle.statusText}</Text>
          </View>
        </View>

        {/* Detail Rows */}
        <View style={[styles.detailGrid, { borderTopColor: colors.border }]}>
          <DetailRow label="Route" value={vehicle.routeName} color={colors} />
          <DetailRow label="Direction" value={`${vehicle.directionLabel} · ${vehicle.tripHeadsign}`} color={colors} />
          <DetailRow label="Current Stop" value={vehicle.stopName} color={colors} />
          <DetailRow label="Coordinates" value={`${vehicle.latitude.toFixed(5)}, ${vehicle.longitude.toFixed(5)}`} color={colors} />
          <DetailRow label="Last Updated" value={vehicle.relativeTime} color={colors} highlight />
        </View>
      </View>
    </View>
  );
}

function DetailRow({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: string;
  color: { text: string; textTertiary: string; [key: string]: string };
  highlight?: boolean;
}) {
  return (
    <View style={detailStyles.row}>
      <Text style={[detailStyles.label, { color: color.textTertiary }]}>{label}</Text>
      <Text
        style={[
          detailStyles.value,
          { color: highlight ? Brand.primary : color.text },
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  map: { flex: 1 },
  fetchingBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: Radius.full,
    padding: Spacing.sm,
  },
  infoPanel: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  panelHeader: { marginBottom: Spacing.lg },
  panelTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  vehicleLabel: { fontSize: FontSize.xxl, fontWeight: FontWeight.heavy },
  routeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  routeBadgeText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  detailGrid: { borderTopWidth: 1, paddingTop: Spacing.lg, gap: Spacing.md },
});

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    width: 100,
  },
  value: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    flex: 1,
    textAlign: 'right',
  },
});
