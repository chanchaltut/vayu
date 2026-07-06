// app/api/forecast/[lat]/[lon]/handlers/getForecast.ts
// GET /api/forecast/:lat/:lon — 24h AQI prediction via Gemini (Sumit's model hook ready)

import { NextRequest, NextResponse } from "next/server";
import { runQuery, DATASET } from "@/lib/bigquery";
import { geminiPro } from "@/lib/gemini";
import { apiError, apiSuccess } from "@/lib/apiError";

interface ReadingRow {
  temperature: number;
  aqi: number;
  timestamp: string;
}

function getTrend(readings: ReadingRow[]): string {
  if (readings.length < 2) return "stable";
  const newest = readings[0].aqi;
  const oldest = readings[readings.length - 1].aqi;
  const diff   = newest - oldest;
  if (diff > 20)  return "rising";
  if (diff < -20) return "falling";
  return "stable";
}

export async function getForecast(
  _req: NextRequest,
  lat: number,
  lon: number
): Promise<NextResponse> {
  if (isNaN(lat) || isNaN(lon)) return apiError("Invalid lat/lon values", 400);

  const sql = `
    SELECT temperature, aqi, timestamp
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET}.sensor_readings\`
    WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 6 HOUR)
      AND ABS(lat - @lat) < 0.05
      AND ABS(lon - @lon) < 0.05
    ORDER BY timestamp DESC
    LIMIT 20
  `;

  const readings = await runQuery<ReadingRow>(sql, { lat, lon });

  if (readings.length === 0) {
    return apiSuccess({
      lat,
      lon,
      predicted_aqi_24h:       100,
      trend:                   "stable",
      confidence:              0.3,
      source:                  "default_estimate",
      current_avg_aqi:         null,
      current_avg_temperature: null,
      readings_used:           0,
      message:                 "No recent sensor readings near this location",
    });
  }

  const avgTemp = readings.reduce((s, r) => s + (r.temperature || 0), 0) / readings.length;
  const avgAqi  = readings.reduce((s, r) => s + r.aqi, 0) / readings.length;
  const trend   = getTrend(readings);

  // ── Hook: Sumit's trained Vertex AI model (uncomment when deployed) ────────
  // if (process.env.SUMIT_MODEL_URL) { ... }

  // ── Gemini fallback ────────────────────────────────────────────────────────
  const prompt = `
You are an air quality forecasting AI for the VAYU pollution monitoring system in India.

Location data for the past 6 hours near lat=${lat}, lon=${lon}:
- Number of sensor readings: ${readings.length}
- Average Temperature: ${avgTemp.toFixed(1)}°C
- Average AQI: ${Math.round(avgAqi)}
- AQI trend: ${trend}
- Recent readings (newest first): ${JSON.stringify(readings.slice(0, 5))}

Based on these readings and typical Indian urban pollution patterns (traffic peaks, wind, temperature inversions), predict the AQI 24 hours from now.

Respond ONLY with valid JSON:
{
  "predicted_aqi_24h": <integer>,
  "trend": "<rising | falling | stable>",
  "confidence": <float 0.0-1.0>,
  "reasoning": "<1 sentence>"
}
`;

  const result = await geminiPro.generateContent(prompt);
  const parsed = JSON.parse(result.response.text());

  return apiSuccess({
    lat,
    lon,
    predicted_aqi_24h:       parsed.predicted_aqi_24h,
    trend:                   parsed.trend,
    confidence:              parsed.confidence,
    source:                  "gemini",
    current_avg_aqi:         Math.round(avgAqi),
    current_avg_temperature: Math.round(avgTemp * 10) / 10,
    readings_used:           readings.length,
    reasoning:               parsed.reasoning,
  });
}
