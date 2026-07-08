// data-pipeline/bqWriter.ts
// Writes sensor readings and hotspots to BigQuery
// Called by ingestSensor, uploadPhoto handlers, and hotspotDetector

import { bq, DATASET } from "../lib/bigquery";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SensorReadingRow {
  id: string;
  device_id: string;
  lat: number;
  lon: number;
  temperature: number | null;
  aqi: number;
  source: "arduino" | "citizen_photo" | "satellite";
  timestamp: string;
}

export interface HotspotRow {
  id: string;
  detected_at: string;
  lat: number;
  lon: number;
  severity: number;
  confidence: number;
  avg_temperature: number | null;
  avg_aqi: number;
  predicted_aqi_24h: number;
  action: string;
  gemini_reasoning: string;
  reading_count: number;
}

// ─── Write a single sensor reading row ───────────────────────────────────────
export const writeSensorReading = async (
  reading: SensorReadingRow
): Promise<SensorReadingRow> => {
  const row: SensorReadingRow = {
    id:          reading.id,
    device_id:   reading.device_id,
    lat:         reading.lat,
    lon:         reading.lon,
    temperature: reading.temperature ?? null,
    aqi:         reading.aqi,
    source:      reading.source || "arduino",
    timestamp:   reading.timestamp || new Date().toISOString(),
  };

  await bq.dataset(DATASET).table("sensor_readings").insert([row]);

  console.log(
    `[BQ] Wrote sensor_reading: id=${row.id}, aqi=${row.aqi}, source=${row.source}`
  );
  return row;
};

// ─── Write a detected hotspot row ─────────────────────────────────────────────
export const writeHotspot = async (hotspot: HotspotRow): Promise<HotspotRow> => {
  await bq.dataset(DATASET).table("hotspots").insert([hotspot]);

  console.log(
    `[BQ] Wrote hotspot: id=${hotspot.id}, severity=${hotspot.severity}, aqi=${hotspot.avg_aqi}`
  );
  return hotspot;
};
