import { mbtaClient } from '@/lib/api/mbta-client';
import {
  transformRouteCollection,
  transformTripCollection,
  transformVehicleCollection,
} from '@/lib/adapters/mbta-transformers';
import type {
  CommuterRoute,
  CommuterTrip,
  CommuterVehicle,
  MbtaCollectionResponse,
  MbtaRoute,
  MbtaTrip,
  MbtaVehicle,
} from '@/types/mbta';

const emitDebugLog = (
  runId: string,
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
) => {
  // #region agent log
  fetch('http://127.0.0.1:7355/ingest/a4bc901a-ff44-4c2a-91d8-3686aeb79153',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8cafb7'},body:JSON.stringify({sessionId:'8cafb7',runId,hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{});
  // #endregion
};

type VehicleQueryParams = {
  offset?: number;
  routeIds?: string[];
  tripIds?: string[];
  directionId?: 0 | 1;
};

export type VehiclePage = {
  items: CommuterVehicle[];
  nextOffset: number | null;
};

export const getVehicles = async ({
  offset = 0,
  routeIds = [],
  tripIds = [],
  directionId,
}: VehicleQueryParams): Promise<VehiclePage> => {
  const params = {
    'page[limit]': 10,
    'page[offset]': offset,
    include: 'stop,trip,route',
    'fields[vehicle]':
      'latitude,longitude,current_status,updated_at,bearing,label,direction_id',
    ...(routeIds.length ? { 'filter[route]': routeIds.join(',') } : {}),
    ...(tripIds.length ? { 'filter[trip]': tripIds.join(',') } : {}),
    ...(directionId !== undefined ? { 'filter[direction_id]': directionId } : {}),
  };
  emitDebugLog('pre-fix', 'H1', 'lib/api/mbta-queries.ts:getVehicles', 'Requesting vehicles', {
    hasApiKey: Boolean(process.env.EXPO_PUBLIC_MBTA_API_KEY),
    params,
  });
  try {
    const response = await mbtaClient.get<MbtaCollectionResponse<MbtaVehicle>>('/vehicles', {
      params,
    });

    const items = transformVehicleCollection(response.data);
    emitDebugLog('pre-fix', 'H4', 'lib/api/mbta-queries.ts:getVehicles', 'Vehicle response parsed', {
      apiDataCount: response.data.data.length,
      transformedCount: items.length,
      nextOffset: items.length < 10 ? null : offset + 10,
    });
    return {
      items,
      nextOffset: items.length < 10 ? null : offset + 10,
    };
  } catch (error) {
    const maybeError = error as { message?: string; response?: { status?: number; data?: unknown } };
    emitDebugLog('pre-fix', 'H1', 'lib/api/mbta-queries.ts:getVehicles', 'Vehicle request failed', {
      message: maybeError.message ?? 'unknown',
      status: maybeError.response?.status ?? null,
      responseData: maybeError.response?.data ?? null,
    });
    throw error;
  }
};

export const getVehicleById = async (id: string): Promise<CommuterVehicle | null> => {
  try {
    const response = await mbtaClient.get<MbtaCollectionResponse<MbtaVehicle>>('/vehicles', {
      params: {
        include: 'stop,trip,route',
        'fields[vehicle]':
          'latitude,longitude,current_status,updated_at,bearing,label,direction_id',
        'filter[id]': id,
      },
    });

    const items = transformVehicleCollection(response.data);
    emitDebugLog('pre-fix', 'H5', 'lib/api/mbta-queries.ts:getVehicleById', 'Vehicle detail lookup result', {
      id,
      found: Boolean(items[0]),
    });
    return items[0] ?? null;
  } catch (error) {
    const maybeError = error as { message?: string; response?: { status?: number } };
    emitDebugLog('pre-fix', 'H5', 'lib/api/mbta-queries.ts:getVehicleById', 'Vehicle detail lookup failed', {
      id,
      message: maybeError.message ?? 'unknown',
      status: maybeError.response?.status ?? null,
    });
    throw error;
  }
};

export const getRoutes = async (): Promise<CommuterRoute[]> => {
  const response = await mbtaClient.get<MbtaCollectionResponse<MbtaRoute>>('/routes', {
    params: {
      'page[limit]': 100,
      'filter[type]': '0,1,2',
    },
  });

  return transformRouteCollection(response.data);
};

export const getTrips = async (routeIds: string[]): Promise<CommuterTrip[]> => {
  const params = {
    'page[limit]': 100,
    ...(routeIds.length ? { 'filter[route]': routeIds.join(',') } : {}),
  };
  emitDebugLog('pre-fix', 'H3', 'lib/api/mbta-queries.ts:getTrips', 'Requesting trips', {
    routeFilterCount: routeIds.length,
    params,
  });
  try {
    const response = await mbtaClient.get<MbtaCollectionResponse<MbtaTrip>>('/trips', {
      params,
    });

    return transformTripCollection(response.data);
  } catch (error) {
    const maybeError = error as { message?: string; response?: { status?: number } };
    emitDebugLog('pre-fix', 'H3', 'lib/api/mbta-queries.ts:getTrips', 'Trips request failed', {
      message: maybeError.message ?? 'unknown',
      status: maybeError.response?.status ?? null,
    });
    throw error;
  }
};
