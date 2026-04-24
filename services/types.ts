






export interface CommuterVehicle {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  bearing: number | null;
  currentStatus: VehicleStatus;
  statusText: string;
  stopName: string;
  stopId: string;
  routeId: string;
  routeName: string;
  routeShortName: string;
  routeColor: string;
  routeTextColor: string;
  tripId: string;
  tripHeadsign: string;
  directionId: number;
  directionLabel: string;
  updatedAt: string;
  relativeTime: string;
}

export type VehicleStatus = 'IN_TRANSIT_TO' | 'STOPPED_AT' | 'INCOMING_AT';

export interface Route {
  id: string;
  shortName: string;
  longName: string;
  color: string;
  textColor: string;
  description: string;
  directionDestinations: [string, string];
  directionNames: [string, string];
  type: number;
  sortOrder: number;
}

export interface Trip {
  id: string;
  headsign: string;
  directionId: number;
  routeId: string;
  name: string;
}



export interface JsonApiResponse<T = JsonApiResource> {
  data: T[];
  included?: JsonApiResource[];
  links?: JsonApiLinks;
  jsonapi?: {version: string;};
}

export interface JsonApiResource {
  type: string;
  id: string;
  attributes: Record<string, unknown>;
  relationships?: Record<string, JsonApiRelationship>;
  links?: Record<string, string>;
}

export interface JsonApiRelationship {
  data: {type: string;id: string;} | null;
}

export interface JsonApiLinks {
  first?: string;
  last?: string;
  next?: string | null;
  prev?: string | null;
}



export interface RawVehicleAttributes {
  label: string;
  latitude: number;
  longitude: number;
  current_status: VehicleStatus;
  updated_at: string;
  bearing: number | null;
}

export interface RawStopAttributes {
  name: string;
  latitude: number;
  longitude: number;
  municipality: string;
  wheelchair_boarding: number;
  location_type: number;
}

export interface RawRouteAttributes {
  long_name: string;
  short_name: string;
  color: string;
  text_color: string;
  description: string;
  direction_destinations: [string, string];
  direction_names: [string, string];
  type: number;
  sort_order: number;
}

export interface RawTripAttributes {
  headsign: string;
  direction_id: number;
  name: string;
  revenue: string;
}



export interface PaginatedResult<T> {
  data: T[];
  hasNextPage: boolean;
  nextOffset: number | null;
}



export interface FilterParams {
  routes: string[];
  trips: string[];
  directionId: number | null;
}