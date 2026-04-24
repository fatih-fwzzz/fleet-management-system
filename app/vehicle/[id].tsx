




import React, { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useColorScheme } from
'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useVehicleDetail } from '@/hooks/use-vehicle-detail';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorState } from '@/components/error-state';
import { Brand, Colors, FontSize, FontWeight, Radius, Shadows, Spacing } from '@/constants/theme';

function buildLeafletHtml(lat: number, lng: number, label: string, status: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    var vehicleIcon = L.divIcon({
      className: 'vehicle-marker',
      html: '<div style="width:32px;height:32px;border-radius:50%;background:${Brand.primary};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;border-radius:50%;background:white;"></div></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    var marker = L.marker([${lat}, ${lng}], { icon: vehicleIcon }).addTo(map);
    marker.bindPopup('<b>#${label}</b><br>${status}');

    window.updatePosition = function(lat, lng, label, status) {
      marker.setLatLng([lat, lng]);
      marker.setPopupContent('<b>#' + label + '</b><br>' + status);
      map.panTo([lat, lng], { animate: true, duration: 0.5 });
    };
  </script>
</body>
</html>`;
}

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{id: string;}>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const { data: vehicle, isLoading, isFetching, error, refetch } = useVehicleDetail(id);


  useEffect(() => {
    if (vehicle && webViewRef.current) {
      const escaped = vehicle.statusText.replace(/'/g, "\\'");
      webViewRef.current.injectJavaScript(
        `if(window.updatePosition) window.updatePosition(${vehicle.latitude}, ${vehicle.longitude}, '${vehicle.label}', '${escaped}'); true;`
      );
    }
  }, [vehicle?.latitude, vehicle?.longitude, vehicle?.statusText]);

  const leafletHtml = useMemo(() => {
    if (!vehicle) return '';
    return buildLeafletHtml(vehicle.latitude, vehicle.longitude, vehicle.label, vehicle.statusText);
  }, [vehicle?.id]);

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
  vehicle.currentStatus === 'IN_TRANSIT_TO' ?
  colors.success :
  vehicle.currentStatus === 'INCOMING_AT' ?
  colors.warning :
  Brand.primary;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {}
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: leafletHtml }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false} />
      

      {}
      {isFetching &&
      <View style={styles.fetchingBadge}>
          <ActivityIndicator size="small" color={Brand.primary} />
        </View>
      }

      {}
      <View style={[styles.infoPanel, { backgroundColor: colors.surface, paddingBottom: insets.bottom + Spacing.lg }, Shadows.lg]}>
        {}
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

        {}
        <View style={[styles.detailGrid, { borderTopColor: colors.border }]}>
          <DetailRow label="Route" value={vehicle.routeName} color={colors} />
          <DetailRow label="Direction" value={`${vehicle.directionLabel} · ${vehicle.tripHeadsign}`} color={colors} />
          <DetailRow label="Current Stop" value={vehicle.stopName} color={colors} />
          <DetailRow label="Coordinates" value={`${vehicle.latitude.toFixed(5)}, ${vehicle.longitude.toFixed(5)}`} color={colors} />
          <DetailRow label="Last Updated" value={vehicle.relativeTime} color={colors} highlight />
        </View>
      </View>
    </View>);

}

function DetailRow({
  label,
  value,
  color,
  highlight





}: {label: string;value: string;color: {text: string;textTertiary: string;[key: string]: string;};highlight?: boolean;}) {
  return (
    <View style={detailStyles.row}>
      <Text style={[detailStyles.label, { color: color.textTertiary }]}>{label}</Text>
      <Text
        style={[
        detailStyles.value,
        { color: highlight ? Brand.primary : color.text }]
        }
        numberOfLines={2}>
        
        {value}
      </Text>
    </View>);

}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  map: { flex: 1 },
  fetchingBadge: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: Radius.full,
    padding: Spacing.sm
  },
  infoPanel: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl
  },
  panelHeader: { marginBottom: Spacing.lg },
  panelTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  vehicleLabel: { fontSize: FontSize.xxl, fontWeight: FontWeight.heavy },
  routeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full
  },
  routeBadgeText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  detailGrid: { borderTopWidth: 1, paddingTop: Spacing.lg, gap: Spacing.md }
});

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    width: 100
  },
  value: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    flex: 1,
    textAlign: 'right'
  }
});