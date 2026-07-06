// app/api/hotspots/handlers/getHotspots.ts
// GET /api/hotspots — returns hotspots from BigQuery, formatted for Google Maps

import { NextRequest, NextResponse } from "next/server";
import { runQuery, DATASET } from "@/lib/bigquery";
import { apiSuccess } from "@/lib/apiError";

interface HotspotRow {
  id: string;
  detected_at: { value: string } | string;
  lat: number;
  lon: number;
  severity: number;
  confidence: number;
  avg_temperature: number;
  avg_aqi: number;
  predicted_aqi_24h: number;
  action: string;
  gemini_reasoning: string;
  reading_count: number;
}

function getAqiCategory(aqi: number): string {
  if (!aqi) return "Unknown";
  if (aqi <= 50)  return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

export async function getHotspots(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const hours       = parseInt(searchParams.get("hours") || "2");
  const minSeverity = parseInt(searchParams.get("severity") || "1");

  const sql = `
    SELECT
      id,
      detected_at,
      lat,
      lon,
      severity,
      confidence,
      avg_temperature,
      avg_aqi,
      predicted_aqi_24h,
      action,
      gemini_reasoning,
      reading_count
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET}.hotspots\`
    WHERE detected_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @hours HOUR)
      AND severity >= @minSeverity
    ORDER BY severity DESC, detected_at DESC
    LIMIT 100
  `;

  const rows = await runQuery<HotspotRow>(sql, { hours, minSeverity });

  const hotspots = rows.map((row) => ({
    id:                row.id,
    lat:               row.lat,
    lon:               row.lon,
    severity:          row.severity,
    confidence:        row.confidence,
    avg_temperature:   row.avg_temperature,
    avg_aqi:           row.avg_aqi,
    predicted_aqi_24h: row.predicted_aqi_24h,
    action:            row.action,
    reasoning:         row.gemini_reasoning,
    reading_count:     row.reading_count,
    detected_at:       typeof row.detected_at === "object" ? row.detected_at.value : row.detected_at,
    // Colour hint for map markers
    colour:       row.severity >= 8 ? "red" : row.severity >= 5 ? "orange" : "yellow",
    aqi_category: getAqiCategory(row.avg_aqi),
  }));

  return apiSuccess({ count: hotspots.length, hours_window: hours, hotspots });
}
