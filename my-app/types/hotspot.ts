// types/hotspot.ts
// Matches the API contract in docs/api-contracts.md

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type HotspotSource = "sensor" | "citizen_photo" | "satellite";

export interface Hotspot {
  id: string;
  lat: number;
  lng: number;
  currentAqi: number;
  predictedAqi24h?: number;
  severity: SeverityLevel;
  sources: HotspotSource[];
  address?: string;
  lastUpdated: string; // ISO string
  createdAt: string;   // ISO string
}
