import { useState, useEffect } from "react";
import * as Location from "expo-location";

export interface UserLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  coords: { lat: number; lon: number } | null;
  loading: boolean;
  error: string | null;
}

export function useUserLocation(): UserLocation {
  const [state, setState] = useState<UserLocation>({
    city: null,
    region: null,
    country: null,
    coords: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          // Fallback: IP-based geolocation
          try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            if (!cancelled) {
              setState({
                city: data.city || null,
                region: data.region || null,
                country: data.country_name || null,
                coords: data.latitude ? { lat: data.latitude, lon: data.longitude } : null,
                loading: false,
                error: null,
              });
            }
          } catch {
            if (!cancelled) {
              setState(s => ({ ...s, loading: false, error: "Localisation indisponible" }));
            }
          }
          return;
        }

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });

        if (!cancelled) {
          setState({
            city: geo?.city || geo?.subregion || null,
            region: geo?.region || null,
            country: geo?.country || null,
            coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
            loading: false,
            error: null,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setState(s => ({ ...s, loading: false, error: e.message }));
        }
      }
    }

    detect();
    return () => { cancelled = true; };
  }, []);

  return state;
}
