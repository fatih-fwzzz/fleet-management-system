





import { fetchVehicles } from '@/services/mbta-adapter';
import type { CommuterVehicle, PaginatedResult } from '@/services/types';
import { useFilterStore } from '@/stores/filter-store';
import { useInfiniteQuery } from '@tanstack/react-query';

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
      directionId
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    staleTime: 10000
  });
}




export function flattenVehiclePages(
pages: PaginatedResult<CommuterVehicle>[] | undefined)
: CommuterVehicle[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.data);
}