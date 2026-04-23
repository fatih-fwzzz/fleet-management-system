export type MbtaEntityType = 'stop' | 'trip' | 'route';

export type MbtaRelationship = {
  data?: {
    id: string;
    type: MbtaEntityType;
  } | null;
};

export type MbtaVehicleAttributes = {
  latitude: number | null;
  longitude: number | null;
  current_status: 'INCOMING_AT' | 'STOPPED_AT' | 'IN_TRANSIT_TO' | null;
  updated_at: string | null;
  bearing: number | null;
  direction_id: 0 | 1 | null;
  label?: string | null;
};

export type MbtaVehicle = {
  id: string;
  type: 'vehicle';
  attributes: MbtaVehicleAttributes;
  relationships: {
    stop?: MbtaRelationship;
    trip?: MbtaRelationship;
    route?: MbtaRelationship;
  };
};

export type MbtaStop = {
  id: string;
  type: 'stop';
  attributes: {
    name: string;
  };
};

export type MbtaTrip = {
  id: string;
  type: 'trip';
  attributes: {
    headsign: string | null;
    direction_id: 0 | 1 | null;
    name?: string | null;
  };
  relationships?: {
    route?: MbtaRelationship;
  };
};

export type MbtaRoute = {
  id: string;
  type: 'route';
  attributes: {
    long_name: string | null;
    short_name: string | null;
  };
};

export type MbtaIncludedEntity = MbtaStop | MbtaTrip | MbtaRoute;

export type MbtaCollectionResponse<T> = {
  data: T[];
  included?: MbtaIncludedEntity[];
};

export type CommuterVehicle = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  status: string;
  updatedAt: string | null;
  bearing: number | null;
  stopName: string;
  destination: string;
  routeName: string;
  tripDirection: 'Outbound' | 'Inbound' | 'Unknown';
  tripId?: string;
  routeId?: string;
};

export type CommuterRoute = {
  id: string;
  name: string;
};

export type CommuterTrip = {
  id: string;
  label: string;
  directionId: 0 | 1 | null;
};
