/**
 * MBTA Adapter / Transformer Layer
 *
 * Converts raw MBTA JSON:API responses into commuter-friendly data models.
 * Resolves relationship IDs to human-readable names from the `included` array.
 * Translates status codes into plain English for the rider experience.
 */

import { mbtaClient } from './api-client';
import type {
  CommuterVehicle,
  FilterParams,
  JsonApiResource,
  JsonApiResponse,
  PaginatedResult,
  RawRouteAttributes,
  RawStopAttributes,
  RawTripAttributes,
  RawVehicleAttributes,
  Route,
  Trip,
  VehicleStatus,
} from './types';

const PAGE_SIZE = 10;

// ─── Relationship Resolver ──────────────────────────────────────────────────

/**
 * Finds a related resource in the `included` array by type and ID.
 */
function resolveIncluded(
  included: JsonApiResource[] | undefined,
  type: string,
  id: string | undefined
): JsonApiResource | undefined {
  if (!included || !id) return undefined;
  return included.find((item) => item.type === type && item.id === id);
}

// ─── Relative Time Formatter ────────────────────────────────────────────────

/**
 * Converts an ISO timestamp into a human-readable relative time string.
 * e.g. "2 min ago", "just now", "1 hr ago"
 */
function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 30) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Status Translator ─────────────────────────────────────────────────────

/**
 * Translates MBTA technical status codes into commuter-friendly text.
 */
function translateStatus(status: VehicleStatus, stopName: string): string {
  switch (status) {
    case 'IN_TRANSIT_TO':
      return `In Transit to ${stopName}`;
    case 'STOPPED_AT':
      return `Stopped at ${stopName}`;
    case 'INCOMING_AT':
      return `Arriving at ${stopName}`;
    default:
      return `Status: ${status}`;
  }
}

/**
 * Returns a simplified status label for badge display.
 */
export function getStatusLabel(status: VehicleStatus): string {
  switch (status) {
    case 'IN_TRANSIT_TO':
      return 'In Transit';
    case 'STOPPED_AT':
      return 'Stopped';
    case 'INCOMING_AT':
      return 'Arriving';
    default:
      return 'Unknown';
  }
}

// ─── Vehicle Transformer ────────────────────────────────────────────────────

/**
 * Transforms a raw JSON:API vehicle resource into a CommuterVehicle.
 */
function transformVehicle(
  raw: JsonApiResource,
  included: JsonApiResource[] | undefined
): CommuterVehicle {
  const attrs = raw.attributes as unknown as RawVehicleAttributes;

  // Resolve relationships
  const stopRelId = raw.relationships?.stop?.data?.id;
  const routeRelId = raw.relationships?.route?.data?.id;
  const tripRelId = raw.relationships?.trip?.data?.id;

  const stopResource = resolveIncluded(included, 'stop', stopRelId);
  const routeResource = resolveIncluded(included, 'route', routeRelId);
  const tripResource = resolveIncluded(included, 'trip', tripRelId);

  const stopAttrs = stopResource?.attributes as unknown as RawStopAttributes | undefined;
  const routeAttrs = routeResource?.attributes as unknown as RawRouteAttributes | undefined;
  const tripAttrs = tripResource?.attributes as unknown as RawTripAttributes | undefined;

  const stopName = stopAttrs?.name ?? 'Unknown Stop';
  const directionId = tripAttrs?.direction_id ?? 0;
  const directionNames = routeAttrs?.direction_names ?? ['Outbound', 'Inbound'];

  return {
    id: raw.id,
    label: attrs.label ?? raw.id,
    latitude: attrs.latitude,
    longitude: attrs.longitude,
    bearing: attrs.bearing,
    currentStatus: attrs.current_status,
    statusText: translateStatus(attrs.current_status, stopName),
    stopName,
    stopId: stopRelId ?? '',
    routeId: routeRelId ?? '',
    routeName: routeAttrs?.long_name ?? 'Unknown Route',
    routeShortName: routeAttrs?.short_name ?? '',
    routeColor: routeAttrs?.color ? `#${routeAttrs.color}` : '#164CA1',
    routeTextColor: routeAttrs?.text_color ? `#${routeAttrs.text_color}` : '#FFFFFF',
    tripId: tripRelId ?? '',
    tripHeadsign: tripAttrs?.headsign ?? 'Unknown',
    directionId,
    directionLabel: directionNames[directionId] ?? 'Unknown',
    updatedAt: attrs.updated_at,
    relativeTime: formatRelativeTime(attrs.updated_at),
  };
}

// ─── API Fetch Functions ────────────────────────────────────────────────────

/**
 * Fetches a paginated list of vehicles with related stops, trips, and routes.
 */
export async function fetchVehicles(
  offset: number = 0,
  filters?: FilterParams
): Promise<PaginatedResult<CommuterVehicle>> {
  const params: Record<string, string> = {
    'page[limit]': String(PAGE_SIZE),
    'page[offset]': String(offset),
    'include': 'stop,trip,route',
    'fields[vehicle]': 'latitude,longitude,current_status,updated_at,bearing,label',
  };

  // Apply filters
  if (filters?.routes && filters.routes.length > 0) {
    params['filter[route]'] = filters.routes.join(',');
  }
  if (filters?.trips && filters.trips.length > 0) {
    params['filter[trip]'] = filters.trips.join(',');
  }
  if (filters?.directionId !== null && filters?.directionId !== undefined) {
    params['filter[direction_id]'] = String(filters.directionId);
  }

  const response = await mbtaClient.get<JsonApiResponse>('/vehicles', { params });
  const { data, included, links } = response.data;

  const vehicles = data.map((raw) => transformVehicle(raw, included));
  const hasNextPage = links?.next != null;
  const nextOffset = hasNextPage ? offset + PAGE_SIZE : null;

  return { data: vehicles, hasNextPage, nextOffset };
}

/**
 * Fetches a single vehicle by ID with full related data.
 */
export async function fetchVehicleDetail(vehicleId: string): Promise<CommuterVehicle | null> {
  const params = {
    'include': 'stop,trip,route',
    'fields[vehicle]': 'latitude,longitude,current_status,updated_at,bearing,label',
  };

  const response = await mbtaClient.get<JsonApiResponse>(`/vehicles/${vehicleId}`, { params });

  // Single resource response wraps data differently
  const rawData = response.data as unknown as {
    data: JsonApiResource;
    included?: JsonApiResource[];
  };

  if (!rawData.data) return null;
  return transformVehicle(rawData.data, rawData.included);
}

/**
 * Fetches all available routes from MBTA.
 */
export async function fetchRoutes(): Promise<Route[]> {
  const response = await mbtaClient.get<JsonApiResponse>('/routes', {
    params: {
      'fields[route]': 'long_name,short_name,color,text_color,description,direction_destinations,direction_names,type,sort_order',
    },
  });

  return response.data.data.map((raw) => {
    const attrs = raw.attributes as unknown as RawRouteAttributes;
    return {
      id: raw.id,
      shortName: attrs.short_name,
      longName: attrs.long_name,
      color: attrs.color ? `#${attrs.color}` : '#164CA1',
      textColor: attrs.text_color ? `#${attrs.text_color}` : '#FFFFFF',
      description: attrs.description ?? '',
      directionDestinations: attrs.direction_destinations ?? ['', ''],
      directionNames: attrs.direction_names ?? ['Outbound', 'Inbound'],
      type: attrs.type,
      sortOrder: attrs.sort_order ?? 0,
    };
  });
}

/**
 * Fetches trips filtered by route IDs.
 */
export async function fetchTrips(routeIds: string[]): Promise<Trip[]> {
  if (routeIds.length === 0) return [];

  const response = await mbtaClient.get<JsonApiResponse>('/trips', {
    params: {
      'filter[route]': routeIds.join(','),
      'fields[trip]': 'headsign,direction_id,name',
      'page[limit]': '100',
    },
  });

  return response.data.data.map((raw) => {
    const attrs = raw.attributes as unknown as RawTripAttributes;
    return {
      id: raw.id,
      headsign: attrs.headsign ?? 'Unknown',
      directionId: attrs.direction_id ?? 0,
      routeId: raw.relationships?.route?.data?.id ?? '',
      name: attrs.name ?? '',
    };
  });
}
