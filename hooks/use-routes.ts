/**
 * TanStack Query hook for fetching available MBTA routes.
 * Routes change infrequently so we use a longer stale time.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchRoutes } from '@/services/mbta-adapter';
import type { Route } from '@/services/types';

export function useRoutes() {
  return useQuery<Route[]>({
    queryKey: ['routes'],
    queryFn: fetchRoutes,
    staleTime: 5 * 60 * 1000, // 5 minutes — routes rarely change
    gcTime: 30 * 60 * 1000,   // Keep in cache for 30 minutes
  });
}
