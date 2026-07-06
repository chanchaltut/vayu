// app/api/sensors/route.ts
// Route Handler for /api/sensors
// GET  → recent readings
// POST → ingest new sensor reading

import { NextRequest } from "next/server";
import { ingestSensor } from "./handlers/ingestSensor";
import { getRecentReadings } from "./handlers/getRecentReadings";
import { apiError } from "@/lib/apiError";

export async function GET() {
  try {
    return await getRecentReadings();
  } catch (err) {
    console.error("[API/sensors GET]", err);
    return apiError("Failed to fetch sensor readings", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    return await ingestSensor(req);
  } catch (err) {
    console.error("[API/sensors POST]", err);
    return apiError("Failed to ingest sensor reading", 500);
  }
}
