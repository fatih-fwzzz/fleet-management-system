




import { useQuery } from '@tanstack/react-query';
import { fetchVehicleDetail } from '@/services/mbta-adapter';
import type { CommuterVehicle } from '@/services/types';

export function useVehicleDetail(vehicleId: string) {
  return useQuery<CommuterVehicle | null>({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => fetchVehicleDetail(vehicleId),
    enabled: !!vehicleId,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    staleTime: 3000
  });
}