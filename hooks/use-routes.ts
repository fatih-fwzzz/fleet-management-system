




import { useQuery } from '@tanstack/react-query';
import { fetchRoutes } from '@/services/mbta-adapter';
import type { Route } from '@/services/types';

export function useRoutes() {
  return useQuery<Route[]>({
    queryKey: ['routes'],
    queryFn: fetchRoutes,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });
}