/**
 * TanStack Query hook for fetching a single vehicle's real-time data.
 * Polls every 5 seconds for near-real-time map tracking in the detail view.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchVehicleDetail } from '@/services/mbta-adapter';
import type { CommuterVehicle } from '@/services/types';

export function useVehicleDetail(vehicleId: string) {
  return useQuery<CommuterVehicle | null>({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => fetchVehicleDetail(vehicleId),
    enabled: !!vehicleId,
    refetchInterval: 5000, // Near-real-time updates for map tracking
    refetchIntervalInBackground: false,
    staleTime: 3000,
  });
}
