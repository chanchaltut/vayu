"use client";
import { useCallback, useEffect, useState } from "react";

export interface Hotspot {
  id: string;
  lat: number;
  lon: number;
  severity: number;
  confidence?: number;
  avg_aqi: number;
  avg_temperature?: number;
  predicted_aqi_24h?: number;
  reasoning: string;
  colour: "red" | "orange" | "yellow" | "green" | string;
  aqi_category: string;
  action: string;
  detected_at?: string;
}

export const HOTSPOTS_UPDATED = "vayu_hotspots_updated";

async function fetchHotspots(): Promise<Hotspot[] | null> {
  try {
    const res = await fetch("/api/hotspots", { cache: "no-store" });
    const json = await res.json();
    return json?.data?.hotspots ?? [];
  } catch (e) {
    console.error("[hotspots]", e);
    return null;
  }
}

/** Loads /api/hotspots and reloads whenever any section fires HOTSPOTS_UPDATED. */
export function useHotspots() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    return fetchHotspots().then((list) => {
      if (list) setHotspots(list);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    let alive = true;
    fetchHotspots().then((list) => {
      if (!alive) return;
      if (list) setHotspots(list);
      setLoaded(true);
    });
    window.addEventListener(HOTSPOTS_UPDATED, reload);
    return () => {
      alive = false;
      window.removeEventListener(HOTSPOTS_UPDATED, reload);
    };
  }, [reload]);

  return { hotspots, loaded, reload };
}

export function mapsKey(): string | undefined {
  // Both spellings appear in the project's docs; accept either.
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || undefined;
}

export function directionsUrl(lat: number, lon: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}
