




import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useColorScheme } from
'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VehicleCard } from '@/components/vehicle-card';
import { VehicleCardSkeletonList } from '@/components/vehicle-card-skeleton';
import { FilterBar } from '@/components/filter-bar';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorState } from '@/components/error-state';
import { EmptyState } from '@/components/empty-state';
import { useVehicles, flattenVehiclePages } from '@/hooks/use-vehicles';
import { useFilterStore } from '@/stores/filter-store';
import { Brand, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { CommuterVehicle } from '@/services/types';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const clearFilters = useFilterStore((s) => s.clearFilters);
  const hasActiveFilters = useFilterStore((s) => s.hasActiveFilters);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    error,
    refetch,
    fetchNextPage,
    hasNextPage
  } = useVehicles();

  const vehicles = useMemo(() => flattenVehiclePages(data?.pages), [data?.pages]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: {item: CommuterVehicle;}) => <VehicleCard vehicle={item} />,
    []
  );

  const keyExtractor = useCallback((item: CommuterVehicle) => item.id, []);


  const ListHeader = useMemo(
    () =>
    <View>
        {}
        <View style={[styles.titleBar, { paddingTop: insets.top + Spacing.md }]}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Fleet Tracker</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Real-time vehicle tracking
            </Text>
          </View>
          {isFetching && !isLoading &&
        <View style={[styles.syncBadge, { backgroundColor: Brand.primaryAlpha10 }]}>
              <View style={[styles.syncDot, { backgroundColor: Brand.primary }]} />
              <Text style={[styles.syncText, { color: Brand.primary }]}>Live</Text>
            </View>
        }
        </View>
        {}
        <FilterBar />
        {}
        {!isLoading && vehicles.length > 0 &&
      <Text style={[styles.countText, { color: colors.textTertiary }]}>
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} active
          </Text>
      }
      </View>,

    [insets.top, colors, isFetching, isLoading, vehicles.length]
  );


  if (error && !data) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.titleBar, { paddingTop: insets.top + Spacing.md }]}>
          <Text style={[styles.title, { color: colors.text }]}>Fleet Tracker</Text>
        </View>
        <ErrorState error={error as Error} onRetry={handleRefresh} />
      </View>);

  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={isLoading ? [] : vehicles}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
        isLoading ?
        <VehicleCardSkeletonList count={5} /> :

        <EmptyState hasActiveFilters={hasActiveFilters()} onClearFilters={clearFilters} />

        }
        ListFooterComponent={
        isFetchingNextPage ?
        <LoadingSpinner size="small" style={{ paddingBottom: insets.bottom + 80 }} /> :

        <View style={{ height: insets.bottom + 80 }} />

        }
        refreshControl={
        <RefreshControl
          refreshing={isFetching && !isLoading && !isFetchingNextPage}
          onRefresh={handleRefresh}
          tintColor={Brand.primary}
          colors={[Brand.primary]} />

        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5} />

    </View>);

}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.heavy,
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 2
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
    marginTop: Spacing.sm
  },
  syncDot: { width: 6, height: 6, borderRadius: 3 },
  syncText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm
  },
  listContent: { flexGrow: 1 }
});