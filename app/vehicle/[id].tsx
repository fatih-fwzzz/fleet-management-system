import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { BRAND_COLOR } from '@/constants/brand';
import { getVehicleById } from '@/lib/api/mbta-queries';

export default function VehicleDetailScreen() {
  const { id, routeName, direction, destination, latitude, longitude } = useLocalSearchParams<{
    id: string;
    routeName: string;
    direction: string;
    destination: string;
    latitude: string;
    longitude: string;
  }>();

  const fallbackLatitude = Number(latitude ?? '42.3601');
  const fallbackLongitude = Number(longitude ?? '-71.0589');

  const { data, isLoading } = useQuery({
    queryKey: ['vehicle-detail', id],
    queryFn: () => getVehicleById(id),
    refetchInterval: 15000,
    staleTime: 5000,
  });

  const markerLatitude = data?.latitude ?? fallbackLatitude;
  const markerLongitude = data?.longitude ?? fallbackLongitude;
  const hasInvalidCoordinates =
    Number.isNaN(markerLatitude) ||
    Number.isNaN(markerLongitude) ||
    !Number.isFinite(markerLatitude) ||
    !Number.isFinite(markerLongitude);

  // #region agent log
  fetch('http://127.0.0.1:7355/ingest/a4bc901a-ff44-4c2a-91d8-3686aeb79153',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8cafb7'},body:JSON.stringify({sessionId:'8cafb7',runId:'pre-fix',hypothesisId:'H5',location:'app/vehicle/[id].tsx:VehicleDetailScreen',message:'Vehicle detail render state',data:{id,isLoading,hasData:Boolean(data),fallbackLatitude,fallbackLongitude,markerLatitude,markerLongitude,hasInvalidCoordinates},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const leafletHtml = useMemo(
    () => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
      .vehicle-dot {
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: ${BRAND_COLOR};
        border: 2px solid white;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.35);
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const lat = ${markerLatitude};
      const lng = ${markerLongitude};
      const map = L.map('map', { zoomControl: false }).setView([lat, lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      const icon = L.divIcon({ className: '', html: '<div class="vehicle-dot"></div>', iconSize: [16, 16] });
      L.marker([lat, lng], { icon }).addTo(map);
      map.invalidateSize();
    </script>
  </body>
</html>
`,
    [markerLatitude, markerLongitude],
  );

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: leafletHtml }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
      />

      <View style={styles.infoPanel}>
        <Text style={styles.title}>{data?.label ?? `Vehicle ${id}`}</Text>
        <Text style={styles.meta}>Route: {data?.routeName ?? routeName ?? 'Unknown route'}</Text>
        <Text style={styles.meta}>Direction: {data?.tripDirection ?? direction ?? 'Unknown'}</Text>
        <Text style={styles.meta}>
          Path: {data?.destination ?? destination ?? 'Unknown destination'}
        </Text>
        <Text style={styles.meta}>
          Position: {markerLatitude.toFixed(5)}, {markerLongitude.toFixed(5)}
        </Text>

        {isLoading ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator color={BRAND_COLOR} />
            <Text style={styles.loaderText}>Refreshing vehicle position...</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8FF',
  },
  map: {
    flex: 1,
  },
  infoPanel: {
    padding: 14,
    backgroundColor: 'white',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: -10,
  },
  title: {
    color: '#0D2654',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },
  meta: {
    color: '#4A6488',
    marginBottom: 5,
  },
  loaderRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loaderText: {
    color: BRAND_COLOR,
  },
});
