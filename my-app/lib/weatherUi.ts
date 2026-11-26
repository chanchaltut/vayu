import type { Dict } from "./i18n/locales/en";

export type ThemeKey = "clear" | "rainy" | "stormy" | "snowy";

export function themeKeyFor(code: number | null): ThemeKey {
  if (code == null) return "clear";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rainy";
  if (code >= 71 && code <= 77) return "snowy";
  if (code >= 95) return "stormy";
  return "clear";
}

export function weatherIcon(code: number | null): string {
  return {
    clear: "/assets/SunCloud.png",
    rainy: "/assets/RainCloud.png",
    snowy: "/assets/SnowCloud.png",
    stormy: "/assets/ThunderCloud.png",
  }[themeKeyFor(code)];
}

export function weatherText(code: number | null, t: Dict): string {
  if (code == null) return "";
  if (code === 0) return t.weather.clear;
  if (code <= 3) return t.weather.partly;
  if (code === 45 || code === 48) return t.weather.fog;
  if (code >= 51 && code <= 57) return t.weather.drizzle;
  if (code >= 61 && code <= 67) return t.weather.rain;
  if (code >= 71 && code <= 77) return t.weather.snow;
  if (code >= 80 && code <= 82) return t.weather.heavyRain;
  if (code >= 95) return t.weather.storm;
  return t.weather.partly;
}

export type AqiKey = "good" | "satisfactory" | "moderate" | "poor" | "veryPoor" | "severe";

export function aqiKey(aqi: number): AqiKey {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "satisfactory";
  if (aqi <= 200) return "moderate";
  if (aqi <= 300) return "poor";
  if (aqi <= 400) return "veryPoor";
  return "severe";
}

/** Maps the English category the API returns ("Very Poor") to a translated label. */
export function aqiCategoryText(category: string | undefined, t: Dict): string {
  const map: Record<string, keyof Dict["aqiShort"]> = {
    good: "good",
    satisfactory: "satisfactory",
    moderate: "moderate",
    poor: "poor",
    "very poor": "veryPoor",
    severe: "severe",
  };
  return t.aqiShort[map[(category ?? "").toLowerCase()] ?? "unknown"];
}

export const AQI_COLOR: Record<AqiKey, string> = {
  good: "#16a34a",
  satisfactory: "#65a30d",
  moderate: "#d97706",
  poor: "#ea580c",
  veryPoor: "#dc2626",
  severe: "#7e22ce",
};

/** Weekday name for a YYYY-MM-DD date in the visitor's language. */
export function weekday(date: string, locale: string): string {
  const [y, m, d] = date.split("-").map(Number);
  try {
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(y, m - 1, d));
  } catch {
    return new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(new Date(y, m - 1, d));
  }
}

/** "3 PM" style hour label for a local YYYY-MM-DDTHH:mm string. */
export function hourLabel(time: string, locale: string): string {
  const h = Number(time.slice(11, 13));
  const d = new Date(2000, 0, 1, h);
  try {
    // "12 pm" → "12pm" so labels fit under narrow chart bars.
    return new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true }).format(d).replace(/\s+(?=[ap]\.?m\.?$)/i, "");
  } catch {
    return new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: true }).format(d);
  }
}
