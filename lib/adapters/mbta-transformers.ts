import type {
  CommuterRoute,
  CommuterTrip,
  CommuterVehicle,
  MbtaCollectionResponse,
  MbtaIncludedEntity,
  MbtaRoute,
  MbtaTrip,
  MbtaVehicle,
} from '@/types/mbta';

const statusMap: Record<string, string> = {
  INCOMING_AT: 'Arriving at',
  IN_TRANSIT_TO: 'In Transit to',
  STOPPED_AT: 'Stopped at',
};

const directionLabel = (directionId: number | null | undefined) => {
  if (directionId === 0) return 'Outbound';
  if (directionId === 1) return 'Inbound';
  return 'Unknown';
};

const toIncludedMap = (included: MbtaIncludedEntity[] | undefined) => {
  const byType = new Map<string, Map<string, MbtaIncludedEntity>>();

  (included ?? []).forEach((entity) => {
    if (!byType.has(entity.type)) {
      byType.set(entity.type, new Map<string, MbtaIncludedEntity>());
    }
    byType.get(entity.type)?.set(entity.id, entity);
  });

  return byType;
};

export const transformVehicleCollection = (
  payload: MbtaCollectionResponse<MbtaVehicle>,
): CommuterVehicle[] => {
  const includedMap = toIncludedMap(payload.included);
  const stops = includedMap.get('stop');
  const trips = includedMap.get('trip');
  const routes = includedMap.get('route');

  return payload.data
    .filter(
      (vehicle) =>
        vehicle.attributes.latitude !== null && vehicle.attributes.longitude !== null,
    )
    .map((vehicle) => {
      const stopId = vehicle.relationships.stop?.data?.id;
      const tripId = vehicle.relationships.trip?.data?.id;
      const routeId = vehicle.relationships.route?.data?.id;

      const stop = stopId ? stops?.get(stopId) : undefined;
      const trip = tripId ? trips?.get(tripId) : undefined;
      const route = routeId ? routes?.get(routeId) : undefined;

      const typedTrip = trip as MbtaTrip | undefined;
      const typedRoute = route as MbtaRoute | undefined;

      return {
        id: vehicle.id,
        label: vehicle.attributes.label ?? `Vehicle ${vehicle.id}`,
        latitude: vehicle.attributes.latitude as number,
        longitude: vehicle.attributes.longitude as number,
        status: statusMap[vehicle.attributes.current_status ?? ''] ?? 'Status unavailable',
        updatedAt: vehicle.attributes.updated_at,
        bearing: vehicle.attributes.bearing,
        stopName:
          stop?.type === 'stop' ? stop.attributes.name : 'Unknown station',
        destination:
          typedTrip?.attributes.headsign ?? typedTrip?.attributes.name ?? 'Unknown destination',
        routeName:
          typedRoute?.attributes.long_name ??
          typedRoute?.attributes.short_name ??
          (routeId ? `Route ${routeId}` : 'Unknown route'),
        tripDirection: directionLabel(
          typedTrip?.attributes.direction_id ?? vehicle.attributes.direction_id,
        ),
        tripId,
        routeId,
      } satisfies CommuterVehicle;
    });
};

export const transformRouteCollection = (
  payload: MbtaCollectionResponse<MbtaRoute>,
): CommuterRoute[] =>
  payload.data.map((route) => ({
    id: route.id,
    name: route.attributes.long_name ?? route.attributes.short_name ?? route.id,
  }));

export const transformTripCollection = (
  payload: MbtaCollectionResponse<MbtaTrip>,
): CommuterTrip[] =>
  payload.data.map((trip) => ({
    id: trip.id,
    label: trip.attributes.headsign ?? trip.attributes.name ?? trip.id,
    directionId: trip.attributes.direction_id,
  }));
