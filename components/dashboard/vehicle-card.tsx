import { Pressable, StyleSheet, Text, View } from "react-native";

import { BRAND_COLOR } from "@/constants/brand";
import { toRelativeTime } from "@/lib/utils/time";
import type { CommuterVehicle } from "@/types/mbta";

type VehicleCardProps = {
  vehicle: CommuterVehicle;
  onPress: () => void;
};

export const VehicleCard = ({ vehicle, onPress }: VehicleCardProps) => {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.registrationGroup}>
          <Text style={styles.registrationCaption}>Vehicle Registration</Text>
          <Text style={styles.label}>#{vehicle.label}</Text>
        </View>
        <Text style={styles.updatedAt}>
          Updated {toRelativeTime(vehicle.updatedAt)}
        </Text>
      </View>

      <Text style={styles.status}>
        {vehicle.status} {vehicle.stopName}
      </Text>
      <Text style={styles.destination}>Destination: {vehicle.destination}</Text>
      <Text style={styles.secondary}>Route: {vehicle.routeName}</Text>
      <Text style={styles.secondary}>Direction: {vehicle.tripDirection}</Text>
      <Text style={styles.secondary}>
        Lat/Lng: {vehicle.latitude.toFixed(5)}, {vehicle.longitude.toFixed(5)}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D5E2F5",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  registrationGroup: {
    flex: 1,
    marginRight: 8,
  },
  registrationCaption: {
    color: "#4A6488",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  label: {
    color: "#0D2654",
    fontWeight: "700",
    fontSize: 16,
  },
  updatedAt: {
    color: "#4A6488",
    fontSize: 12,
  },
  status: {
    color: BRAND_COLOR,
    fontWeight: "700",
    marginBottom: 6,
  },
  destination: {
    color: "#0D2654",
    marginBottom: 4,
  },
  secondary: {
    color: "#4A6488",
    marginBottom: 2,
  },
});
