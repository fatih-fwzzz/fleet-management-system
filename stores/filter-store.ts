/**
 * Zustand store for commuter filter preferences.
 * Manages selected routes, trips, and direction filters.
 * Selections persist as the user navigates through the app.
 */

import { create } from 'zustand';

interface FilterState {
  /** Selected route IDs for filtering vehicles */
  selectedRoutes: string[];
  /** Selected trip IDs for filtering vehicles */
  selectedTrips: string[];
  /** Direction filter: 0 = Outbound, 1 = Inbound, null = All */
  directionId: number | null;

  /** Toggle a route in/out of the selection */
  toggleRoute: (routeId: string) => void;
  /** Toggle a trip in/out of the selection */
  toggleTrip: (tripId: string) => void;
  /** Set direction filter */
  setDirection: (directionId: number | null) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Check if any filters are active */
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  selectedRoutes: [],
  selectedTrips: [],
  directionId: null,

  toggleRoute: (routeId: string) =>
    set((state) => {
      const isSelected = state.selectedRoutes.includes(routeId);
      const selectedRoutes = isSelected
        ? state.selectedRoutes.filter((id) => id !== routeId)
        : [...state.selectedRoutes, routeId];

      // Clear trips that belong to deselected routes
      const selectedTrips = isSelected
        ? state.selectedTrips // Keep trips for now; they'll be filtered out by the hook
        : state.selectedTrips;

      return { selectedRoutes, selectedTrips };
    }),

  toggleTrip: (tripId: string) =>
    set((state) => {
      const isSelected = state.selectedTrips.includes(tripId);
      return {
        selectedTrips: isSelected
          ? state.selectedTrips.filter((id) => id !== tripId)
          : [...state.selectedTrips, tripId],
      };
    }),

  setDirection: (directionId: number | null) => set({ directionId }),

  clearFilters: () =>
    set({
      selectedRoutes: [],
      selectedTrips: [],
      directionId: null,
    }),

  hasActiveFilters: () => {
    const state = get();
    return (
      state.selectedRoutes.length > 0 ||
      state.selectedTrips.length > 0 ||
      state.directionId !== null
    );
  },
}));
