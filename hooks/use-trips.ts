/**
 * TanStack Query hook for fetching trips filtered by selected routes.
 * Only fetches when routes are selected; returns empty otherwise.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchTrips } from '@/services/mbta-adapter';
import type { Trip } from '@/services/types';

export function useTrips(routeIds: string[]) {
  return useQuery<Trip[]>({
    queryKey: ['trips', routeIds],
    queryFn: () => fetchTrips(routeIds),
    enabled: routeIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
