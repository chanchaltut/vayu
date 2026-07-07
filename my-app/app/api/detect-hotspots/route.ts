// app/api/detect-hotspots/route.ts
// POST /api/detect-hotspots
// Triggers the Gemini fusion engine:
//   1. Reads last 30 min of sensor_readings from BigQuery
//   2. Groups into geo-clusters (~500m grid)
//   3. Calls Gemini for each cluster → hotspot decision
//   4. Writes confirmed hotspots to BigQuery hotspots table
//
// Can be called:
//   - Manually (Postman / curl) during testing
//   - Via a "Run Detection" button on the dashboard
//   - On a schedule via Cloud Scheduler → this endpoint

import { NextResponse } from "next/server";
import { detectAndSaveHotspots } from "@/bigquery-gemini-fusion/hotspotDetector";
import { apiError } from "@/lib/apiError";

export async function POST() {
  try {
    console.log("[API/detect-hotspots] Detection triggered via API");

    const result = await detectAndSaveHotspots();

    return NextResponse.json({
      success: true,
      data: {
        message: "Hotspot detection complete",
        hotspots_detected: result.hotspotsDetected,
        hotspots_saved:    result.hotspotsSaved,
      },
    });
  } catch (err) {
    console.error("[API/detect-hotspots] Error:", err);
    return apiError("Hotspot detection failed", 500);
  }
}
