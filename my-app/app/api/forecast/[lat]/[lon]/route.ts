// app/api/forecast/[lat]/[lon]/route.ts
// GET /api/forecast/:lat/:lon

import { NextRequest } from "next/server";
import { getForecast } from "./handlers/getForecast";
import { apiError } from "@/lib/apiError";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lat: string; lon: string }> }
) {
  try {
    const { lat: latStr, lon: lonStr } = await params;
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    return await getForecast(req, lat, lon);
  } catch (err) {
    console.error("[API/forecast GET]", err);
    return apiError("Failed to generate forecast", 500);
  }
}
