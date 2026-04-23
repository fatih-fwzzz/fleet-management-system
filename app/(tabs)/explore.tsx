import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FilterChip } from "@/components/dashboard/filter-chip";
import { BRAND_COLOR } from "@/constants/brand";
import { getRoutes, getTrips } from "@/lib/api/mbta-queries";
import { useFilterStore } from "@/lib/store/filter-store";

export default function FilterScreen() {
  const selectedRouteIds = useFilterStore((state) => state.selectedRouteIds);
  const selectedTripIds = useFilterStore((state) => state.selectedTripIds);
  const toggleRoute = useFilterStore((state) => state.toggleRoute);
  const toggleTrip = useFilterStore((state) => state.toggleTrip);
  const clearAll = useFilterStore((state) => state.clearAll);

  const routesQuery = useQuery({
    queryKey: ["routes"],
    queryFn: getRoutes,
    staleTime: 1000 * 60 * 5,
  });

  const tripsQuery = useQuery({
    queryKey: ["trips", selectedRouteIds],
    queryFn: () => getTrips(selectedRouteIds),
    staleTime: 1000 * 60,
  });

  const tripDirectionCounts = useMemo(() => {
    let outbound = 0;
    let inbound = 0;
    (tripsQuery.data ?? []).forEach((trip) => {
      if (trip.directionId === 0) outbound += 1;
      if (trip.directionId === 1) inbound += 1;
    });

    return { outbound, inbound };
  }, [tripsQuery.data]);

  if (routesQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={BRAND_COLOR} size="large" />
        <Text style={styles.loadingText}>Loading active routes...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Route & Trip Selection</Text>
      <Text style={styles.subtitle}>
        Multi-select your commute path. Filters stay active across screens.
      </Text>

      <View style={styles.selectionContainer}>
        <Text style={styles.selectionText}>
          {selectedRouteIds.length} routes selected - {selectedTripIds.length}{" "}
          trips selected
        </Text>
        <Text style={styles.clearAction} onPress={clearAll}>
          Clear all
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Routes</Text>
      <View style={styles.chipWrap}>
        {(routesQuery.data ?? []).map((route) => (
          <FilterChip
            key={route.id}
            label={route.name}
            active={selectedRouteIds.includes(route.id)}
            onPress={() => toggleRoute(route.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Trips</Text>
      {tripsQuery.isFetching ? (
        <ActivityIndicator color={BRAND_COLOR} />
      ) : (
        <View style={styles.chipWrap}>
          {(tripsQuery.data ?? []).map((trip) => (
            <FilterChip
              key={trip.id}
              label={trip.label}
              active={selectedTripIds.includes(trip.id)}
              onPress={() => toggleTrip(trip.id)}
            />
          ))}
        </View>
      )}

      <View style={styles.directionCard}>
        <Text style={styles.directionTitle}>Direction Coverage</Text>
        <Text style={styles.directionText}>
          Outbound (0): {tripDirectionCounts.outbound}
        </Text>
        <Text style={styles.directionText}>
          Inbound (1): {tripDirectionCounts.inbound}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    backgroundColor: "#F4F8FF",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F8FF",
  },
  loadingText: {
    marginTop: 10,
    color: "#35598A",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0D2654",
  },
  subtitle: {
    color: "#4A6488",
    marginTop: 4,
    marginBottom: 16,
  },
  selectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  selectionText: {
    color: "#35598A",
  },
  clearAction: {
    color: BRAND_COLOR,
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#0D2654",
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 10,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
    marginBottom: 8,
  },
  directionCard: {
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C8DBF5",
    backgroundColor: "#FFFFFF",
  },
  directionTitle: {
    color: "#0D2654",
    fontWeight: "700",
    marginBottom: 4,
  },
  directionText: {
    color: "#4A6488",
  },
});
