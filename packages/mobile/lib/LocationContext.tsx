import React, { createContext, useContext } from "react";
import { useUserLocation, UserLocation } from "./useLocation";

const LocationContext = createContext<UserLocation>({
  city: null,
  region: null,
  country: null,
  coords: null,
  loading: true,
  error: null,
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const location = useUserLocation();
  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
