// app/api/sensors/handlers/ingestSensor.ts
// POST /api/sensors — receives sensor readings from Parth's Arduino

import { NextRequest, NextResponse } from "next/server";
import { bq, DATASET } from "@/lib/bigquery";
import { apiError, apiSuccess } from "@/lib/apiError";

interface SensorBody {
  device_id: string;
  lat: number;
  lon: number;
  temperature: number;
  aqi: number;
  timestamp?: string;
}

export async function ingestSensor(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as Partial<SensorBody>;

  const { device_id, lat, lon, temperature, aqi, timestamp } = body;

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!device_id) return apiError("Missing required field: device_id", 400);
  if (lat === undefined || lat === null) return apiError("Missing required field: lat", 400);
  if (lon === undefined || lon === null) return apiError("Missing required field: lon", 400);
  if (temperature === undefined || temperature === null) return apiError("Missing required field: temperature", 400);
  if (aqi === undefined || aqi === null) return apiError("Missing required field: aqi", 400);

  const reading = {
    id:          crypto.randomUUID(),
    device_id:   String(device_id),
    lat:         parseFloat(String(lat)),
    lon:         parseFloat(String(lon)),
    temperature: parseFloat(String(temperature)),
    aqi:         parseInt(String(aqi)),
    source:      "arduino",
    timestamp:   timestamp || new Date().toISOString(),
  };

  // ── Write to BigQuery ─────────────────────────────────────────────────────
  await bq.dataset(DATASET).table("sensor_readings").insert([reading]);

  console.log(
    `[SENSOR] Ingested: device=${reading.device_id}, aqi=${reading.aqi}, temp=${reading.temperature}°C`
  );

  return apiSuccess({
    reading_id: reading.id,
    message:    "Sensor reading recorded successfully",
    data:       reading,
  }, 201);
}
