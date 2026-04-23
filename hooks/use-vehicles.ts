/**
 * TanStack Query hook for fetching paginated vehicles.
 * Integrates with Zustand filter store for route/trip/direction filtering.
 * Supports infinite scrolling with automatic background sync.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchVehicles } from '@/services/mbta-adapter';
import { useFilterStore } from '@/stores/filter-store';
import type { CommuterVehicle, PaginatedResult } from '@/services/types';

export function useVehicles() {
  const selectedRoutes = useFilterStore((s) => s.selectedRoutes);
  const selectedTrips = useFilterStore((s) => s.selectedTrips);
  const directionId = useFilterStore((s) => s.directionId);

  return useInfiniteQuery<PaginatedResult<CommuterVehicle>>({
    queryKey: ['vehicles', { routes: selectedRoutes, trips: selectedTrips, directionId }],
    queryFn: ({ pageParam = 0 }) =>
      fetchVehicles(pageParam as number, {
        routes: selectedRoutes,
        trips: selectedTrips,
        directionId,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    refetchInterval: 15000, // Auto-refresh every 15s for live updates
    refetchIntervalInBackground: false,
    staleTime: 10000,
  });
}

/**
 * Helper to flatten paginated results into a single array.
 */
export function flattenVehiclePages(
  pages: PaginatedResult<CommuterVehicle>[] | undefined
): CommuterVehicle[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.data);
}
