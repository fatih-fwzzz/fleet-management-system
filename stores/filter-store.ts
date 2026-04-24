





import { create } from 'zustand';

interface FilterState {

  selectedRoutes: string[];

  selectedTrips: string[];

  directionId: number | null;


  toggleRoute: (routeId: string) => void;

  toggleTrip: (tripId: string) => void;

  setDirection: (directionId: number | null) => void;

  clearFilters: () => void;

  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  selectedRoutes: [],
  selectedTrips: [],
  directionId: null,

  toggleRoute: (routeId: string) =>
  set((state) => {
    const isSelected = state.selectedRoutes.includes(routeId);
    const selectedRoutes = isSelected ?
    state.selectedRoutes.filter((id) => id !== routeId) :
    [...state.selectedRoutes, routeId];


    const selectedTrips = isSelected ?
    state.selectedTrips :
    state.selectedTrips;

    return { selectedRoutes, selectedTrips };
  }),

  toggleTrip: (tripId: string) =>
  set((state) => {
    const isSelected = state.selectedTrips.includes(tripId);
    return {
      selectedTrips: isSelected ?
      state.selectedTrips.filter((id) => id !== tripId) :
      [...state.selectedTrips, tripId]
    };
  }),

  setDirection: (directionId: number | null) => set({ directionId }),

  clearFilters: () =>
  set({
    selectedRoutes: [],
    selectedTrips: [],
    directionId: null
  }),

  hasActiveFilters: () => {
    const state = get();
    return (
      state.selectedRoutes.length > 0 ||
      state.selectedTrips.length > 0 ||
      state.directionId !== null);

  }
}));