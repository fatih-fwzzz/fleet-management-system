import { create } from "zustand";

type FilterStore = {
  selectedRouteIds: string[];
  selectedTripIds: string[];
  toggleRoute: (routeId: string) => void;
  toggleTrip: (tripId: string) => void;
  clearAll: () => void;
};

export const useFilterStore = create<FilterStore>((set) => ({
  selectedRouteIds: [],
  selectedTripIds: [],
  toggleRoute: (routeId) =>
    set((state) => ({
      selectedRouteIds: state.selectedRouteIds.includes(routeId)
        ? state.selectedRouteIds.filter((id) => id !== routeId)
        : [...state.selectedRouteIds, routeId],
    })),
  toggleTrip: (tripId) =>
    set((state) => ({
      selectedTripIds: state.selectedTripIds.includes(tripId)
        ? state.selectedTripIds.filter((id) => id !== tripId)
        : [...state.selectedTripIds, tripId],
    })),
  clearAll: () =>
    set({
      selectedRouteIds: [],
      selectedTripIds: [],
    }),
}));
