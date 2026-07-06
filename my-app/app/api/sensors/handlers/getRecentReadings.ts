// app/api/sensors/handlers/getRecentReadings.ts
// GET /api/sensors — returns last 50 sensor readings for dashboard/debugging

import { NextResponse } from "next/server";
import { runQuery, DATASET } from "@/lib/bigquery";
import { apiSuccess } from "@/lib/apiError";

interface SensorRow {
  id: string;
  device_id: string;
  lat: number;
  lon: number;
  temperature: number;
  aqi: number;
  source: string;
  timestamp: string;
}

export async function getRecentReadings(): Promise<NextResponse> {
  const sql = `
    SELECT id, device_id, lat, lon, temperature, aqi, source, timestamp
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET}.sensor_readings\`
    ORDER BY timestamp DESC
    LIMIT 50
  `;

  const readings = await runQuery<SensorRow>(sql);

  return apiSuccess({ count: readings.length, readings });
}
