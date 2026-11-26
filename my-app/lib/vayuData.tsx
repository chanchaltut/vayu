"use client";
// One place that resolves the visitor's location and loads weather + air quality
// for it. Hero and the Detect section both read from here, so the page makes one
// set of requests instead of three.

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

export interface Coords {
  lat: number;
  lon: number;
}

export interface DailyWeather {
  date: string; // YYYY-MM-DD (local to the location)
  max: number;
  min: number;
  code: number;
}

export interface HourlyAqi {
  time: string; // YYYY-MM-DDTHH:mm (local to the location)
  aqi: number;
}

interface VayuData {
  coords: Coords;
  /** Place name, or null while still resolving. */
  place: string | null;
  temperature: number | null;
  weatherCode: number | null;
  aqi: number | null;
  daily: DailyWeather[];
  pastAqi: HourlyAqi[];
  nextAqi: HourlyAqi[];
  locating: boolean;
  /** Ask the browser for a precise GPS fix (prompts the user). */
  requestPreciseLocation: () => void;
}

const DEFAULT: Coords = { lat: 22.5726, lon: 88.3639 }; // Kolkata
const DEFAULT_PLACE = "Kolkata, India";
export const UPLOAD_COORDS_KEY = "vayu_last_upload_coords";

const Ctx = createContext<VayuData | null>(null);

async function getJson<T = unknown>(url: string, timeoutMs = 8000): Promise<T> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(id);
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const data = await getJson<{ address?: Record<string, string> }>(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=14`
    );
    const a = data.address ?? {};
    const place = a.suburb || a.neighbourhood || a.town || a.village || a.city_district || a.city || a.county || a.state;
    const country = a.country || "India";
    return place ? `${place}, ${country}` : null;
  } catch {
    return null;
  }
}

async function resolveApproximateLocation(): Promise<{ coords: Coords; place: string | null }> {
  // 1. IP lookup — no permission prompt.
  try {
    const d = await getJson<{ latitude?: number; longitude?: number; city?: string; country_name?: string }>(
      "https://ipapi.co/json/",
      5000
    );
    if (d.latitude && d.longitude) {
      return {
        coords: { lat: d.latitude, lon: d.longitude },
        place: d.city ? `${d.city}, ${d.country_name || "India"}` : null,
      };
    }
  } catch {
    /* fall through */
  }

  // 2. Where this visitor last reported from.
  try {
    const cached = JSON.parse(localStorage.getItem(UPLOAD_COORDS_KEY) || "null");
    if (cached?.lat && cached?.lon) return { coords: { lat: cached.lat, lon: cached.lon }, place: null };
  } catch {
    /* ignore */
  }

  // 3. Latest VAYU hardware node.
  try {
    const json = await getJson<{ data?: { readings?: { lat: number; lon: number; source?: string }[] } }>(
      "/api/sensors",
      6000
    );
    const node = json?.data?.readings?.find((r) => r.source === "arduino");
    if (node?.lat && node?.lon) return { coords: { lat: node.lat, lon: node.lon }, place: null };
  } catch {
    /* ignore */
  }

  return { coords: DEFAULT, place: DEFAULT_PLACE };
}

export function VayuDataProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number | null>(null);
  const [aqi, setAqi] = useState<number | null>(null);
  const [daily, setDaily] = useState<DailyWeather[]>([]);
  const [pastAqi, setPastAqi] = useState<HourlyAqi[]>([]);
  const [nextAqi, setNextAqi] = useState<HourlyAqi[]>([]);

  // Resolve approximate location once.
  useEffect(() => {
    let cancelled = false;
    resolveApproximateLocation().then(async (r) => {
      if (cancelled) return;
      setCoords(r.coords);
      setPlace(r.place ?? (await reverseGeocode(r.coords.lat, r.coords.lon)) ?? DEFAULT_PLACE);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const requestPreciseLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(c);
        setPlace((await reverseGeocode(c.lat, c.lon)) ?? `${c.lat.toFixed(3)}, ${c.lon.toFixed(3)}`);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Weather + AQI whenever the location changes.
  useEffect(() => {
    if (!coords) return;
    const { lat, lon } = coords;
    let cancelled = false;

    getJson<{
      current?: { temperature_2m?: number; weather_code?: number };
      daily?: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[] };
    }>(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code` +
        `&timezone=auto&forecast_days=7`
    )
      .then((w) => {
        if (cancelled) return;
        if (w.current?.temperature_2m != null) setTemperature(Math.round(w.current.temperature_2m));
        if (w.current?.weather_code != null) setWeatherCode(w.current.weather_code);
        if (w.daily?.time) {
          setDaily(
            w.daily.time.map((date, i) => ({
              date,
              max: Math.round(w.daily!.temperature_2m_max[i]),
              min: Math.round(w.daily!.temperature_2m_min[i]),
              code: w.daily!.weather_code[i],
            }))
          );
        }
      })
      .catch((e) => console.error("[weather]", e));

    getJson<{ current?: { us_aqi?: number; time?: string }; hourly?: { time: string[]; us_aqi: (number | null)[] } }>(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
        `&current=us_aqi&hourly=us_aqi&past_hours=7&forecast_hours=25&timezone=auto`
    )
      .then((a) => {
        if (cancelled) return;
        if (a.current?.us_aqi != null) setAqi(Math.round(a.current.us_aqi));
        const times = a.hourly?.time ?? [];
        const vals = a.hourly?.us_aqi ?? [];
        const nowKey = (a.current?.time ?? "").slice(0, 13); // YYYY-MM-DDTHH
        const rows = times
          .map((time, i) => ({ time, aqi: vals[i] }))
          .filter((r): r is HourlyAqi => r.aqi != null);
        const idx = Math.max(0, rows.findIndex((r) => r.time.slice(0, 13) === nowKey));
        setPastAqi(rows.slice(Math.max(0, idx - 6), idx + 1));
        setNextAqi(rows.slice(idx + 1, idx + 25));
      })
      .catch((e) => console.error("[aqi]", e));

    return () => {
      cancelled = true;
    };
  }, [coords]);

  return (
    <Ctx.Provider
      value={{
        coords: coords ?? DEFAULT,
        place,
        temperature,
        weatherCode,
        aqi,
        daily,
        pastAqi,
        nextAqi,
        locating,
        requestPreciseLocation,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useVayuData(): VayuData {
  const v = useContext(Ctx);
  if (!v) throw new Error("useVayuData must be used inside <VayuDataProvider>");
  return v;
}
