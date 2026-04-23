import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { VehicleCard } from "@/components/dashboard/vehicle-card";
import { BRAND_COLOR } from "@/constants/brand";
import { getVehicles } from "@/lib/api/mbta-queries";
import { useFilterStore } from "@/lib/store/filter-store";

export default function DashboardScreen() {
  const router = useRouter();
  const selectedRouteIds = useFilterStore((state) => state.selectedRouteIds);
  const selectedTripIds = useFilterStore((state) => state.selectedTripIds);

  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["vehicles", selectedRouteIds, selectedTripIds],
    queryFn: ({ pageParam }) =>
      getVehicles({
        offset: pageParam,
        routeIds: selectedRouteIds,
        tripIds: selectedTripIds,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 15000,
    refetchInterval: 20000,
  });

  const vehicles = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  );

  // #region agent log
  fetch("http://127.0.0.1:7355/ingest/a4bc901a-ff44-4c2a-91d8-3686aeb79153", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8cafb7",
    },
    body: JSON.stringify({
      sessionId: "8cafb7",
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "app/(tabs)/index.tsx:DashboardScreen",
      message: "Dashboard render state",
      data: {
        isLoading,
        isRefetching,
        hasNextPage: Boolean(hasNextPage),
        vehiclesCount: vehicles.length,
        hasError: Boolean(error),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (isLoading) {
    return (
      <View style={styles.skeletonContainer}>
        <Text style={styles.title}>Commuter Dashboard</Text>
        <Text style={styles.subtitle}>Loading live vehicles...</Text>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.skeletonCard}>
            <View style={styles.skeletonLineLg} />
            <View style={styles.skeletonLineMd} />
            <View style={styles.skeletonLineSm} />
          </View>
        ))}
        <ActivityIndicator
          size="large"
          color={BRAND_COLOR}
          style={styles.skeletonSpinner}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>MBTA Server Offline</Text>
        <Text style={styles.errorSubtitle}>
          We cannot load live vehicles right now. Pull to refresh and try again.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={vehicles}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={({ item }) => (
        <VehicleCard
          vehicle={item}
          onPress={() => {
            const params = new URLSearchParams({
              routeName: item.routeName,
              direction: item.tripDirection,
              destination: item.destination,
              latitude: String(item.latitude),
              longitude: String(item.longitude),
              bearing: String(item.bearing ?? 0),
            }).toString();

            // #region agent log
            fetch(
              "http://127.0.0.1:7355/ingest/a4bc901a-ff44-4c2a-91d8-3686aeb79153",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Debug-Session-Id": "8cafb7",
                },
                body: JSON.stringify({
                  sessionId: "8cafb7",
                  runId: "pre-fix",
                  hypothesisId: "H2",
                  location: "app/(tabs)/index.tsx:onVehiclePress",
                  message: "Navigating to vehicle detail",
                  data: {
                    vehicleId: item.id,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    routeName: item.routeName,
                  },
                  timestamp: Date.now(),
                }),
              },
            ).catch(() => {});
            // #endregion

            router.push(`/vehicle/${item.id}?${params}` as unknown as never);
          }}
        />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Commuter Dashboard</Text>
          <Text style={styles.subtitle}>
            Real-time MBTA vehicles with active route/trip filters.
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Active Vehicles Found</Text>
          <Text style={styles.emptySubtitle}>
            Change route/trip filters in the Filters tab or refresh for updates.
          </Text>
        </View>
      }
      onEndReachedThreshold={0.3}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.paginationLoader}>
            <ActivityIndicator color={BRAND_COLOR} />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={BRAND_COLOR}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#F4F8FF",
    minHeight: "100%",
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 16,
    backgroundColor: "#F4F8FF",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#F4F8FF",
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0D2654",
    marginBottom: 4,
  },
  subtitle: {
    color: "#4A6488",
  },
  errorTitle: {
    color: "#9B1C1C",
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 18,
  },
  errorSubtitle: {
    textAlign: "center",
    color: "#4A6488",
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#0D2654",
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#4A6488",
    textAlign: "center",
  },
  paginationLoader: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  skeletonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D5E2F5",
    padding: 14,
    marginBottom: 12,
  },
  skeletonLineLg: {
    width: "55%",
    height: 16,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#DCE8F7",
  },
  skeletonLineMd: {
    width: "90%",
    height: 14,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#E4EDF9",
  },
  skeletonLineSm: {
    width: "65%",
    height: 14,
    borderRadius: 8,
    backgroundColor: "#E4EDF9",
  },
  skeletonSpinner: {
    marginTop: 10,
  },
});
