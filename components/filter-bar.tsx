




import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useRoutes } from '@/hooks/use-routes';
import { useTrips } from '@/hooks/use-trips';
import { useFilterStore } from '@/stores/filter-store';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

export function FilterBar() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const selectedRoutes = useFilterStore((s) => s.selectedRoutes);
  const selectedTrips = useFilterStore((s) => s.selectedTrips);
  const directionId = useFilterStore((s) => s.directionId);
  const toggleRoute = useFilterStore((s) => s.toggleRoute);
  const toggleTrip = useFilterStore((s) => s.toggleTrip);
  const setDirection = useFilterStore((s) => s.setDirection);
  const clearFilters = useFilterStore((s) => s.clearFilters);

  const { data: routes, isLoading: routesLoading } = useRoutes();
  const { data: trips } = useTrips(selectedRoutes);

  const hasFilters = selectedRoutes.length > 0 || selectedTrips.length > 0 || directionId !== null;


  const uniqueTrips = useMemo(() => {
    if (!trips) return [];
    const seen = new Set<string>();
    return trips.filter((trip) => {
      const key = `${trip.routeId}-${trip.headsign}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [trips]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>Direction</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {[
          { label: 'All', value: null },
          { label: 'Outbound', value: 0 },
          { label: 'Inbound', value: 1 }].
          map((item) => {
            const isActive = directionId === item.value;
            return (
              <Pressable
                key={item.label}
                style={[
                styles.chip,
                { borderColor: isActive ? Brand.primary : colors.border },
                isActive && { backgroundColor: Brand.primaryAlpha20 }]
                }
                onPress={() => setDirection(item.value)}>
                
                <Text style={[styles.chipText, { color: isActive ? Brand.primary : colors.textSecondary }]}>
                  {item.label}
                </Text>
              </Pressable>);

          })}
        </ScrollView>
      </View>

      {}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
          Routes {routesLoading ? '(Loading...)' : `(${routes?.length ?? 0})`}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {routes?.slice(0, 30).map((route) => {
            const isActive = selectedRoutes.includes(route.id);
            return (
              <Pressable
                key={route.id}
                style={[
                styles.chip,
                { borderColor: isActive ? route.color : colors.border },
                isActive && { backgroundColor: route.color + '20' }]
                }
                onPress={() => toggleRoute(route.id)}>
                
                <View style={[styles.routeDot, { backgroundColor: route.color }]} />
                <Text
                  style={[styles.chipText, { color: isActive ? route.color : colors.textSecondary }]}
                  numberOfLines={1}>
                  
                  {route.shortName || route.id}
                </Text>
              </Pressable>);

          })}
        </ScrollView>
      </View>

      {}
      {uniqueTrips.length > 0 &&
      <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>Trips</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {uniqueTrips.slice(0, 20).map((trip) => {
            const isActive = selectedTrips.includes(trip.id);
            return (
              <Pressable
                key={trip.id}
                style={[
                styles.chip,
                { borderColor: isActive ? Brand.primary : colors.border },
                isActive && { backgroundColor: Brand.primaryAlpha20 }]
                }
                onPress={() => toggleTrip(trip.id)}>
                
                  <Text style={[styles.chipText, { color: isActive ? Brand.primary : colors.textSecondary }]}>
                    {trip.headsign}
                  </Text>
                </Pressable>);

          })}
          </ScrollView>
        </View>
      }

      {}
      {hasFilters &&
      <Pressable style={styles.clearRow} onPress={clearFilters}>
          <Text style={[styles.clearText, { color: colors.error }]}>✕ Clear All Filters</Text>
        </Pressable>
      }
    </View>);

}

const styles = StyleSheet.create({
  container: { paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  section: { marginBottom: Spacing.sm },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs
  },
  chipRow: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5
  },
  chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  clearRow: { alignItems: 'center', paddingVertical: Spacing.sm },
  clearText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold }
});